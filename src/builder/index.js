const path = require('path');
const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true }); //.addSchema(declarationSchema);
const { Container } = require('../index');
const ModuleSystem = require('../module-system');
const { StdoutTransport } = require('../logger');
const _ = require('lodash');
require('./abstract-export');
require('./xlsx-export');

/**
 * Auxilary class for performing compilation. It is developed to support CLI of Heta compiler.
 *
 * @class Builder
 *
 * @param {Object} declaration - Object representing options for builder,
 * see [CLI references](./cli-references) for more information about the structure.
 * @param {string} coreDirname="." - Path of working directory (WD) for Heta compilation.
 * Default: WD of a shell.
 *
 * @property {string} path String describing hierarchy
 * @property {ObjectId} _id Unique authomatic identifier from MongoDB
 * @property {string} id Main identifier (unique for the collection)
 * @property {string} class=Compartment It is always fixed to "Compartment"
 * @property {Object.<string,string>} [tags] Object for filering elements by tagFilter
 * @property {string} [title] Title of the element, any string.
 * @property {string} [notes] Text with xhtml tags or markdown.
 * @property {Object.<String,Object>} [aux] Any object to store auxilary information
 *
 * @property {string} variableRef Reference to Variable. If not initialized directly than use id value
 */
class Builder {
  constructor(declaration, coreDirname = '.'){
    // create container
    this.container = new Container();

    // set transport and logger
    this.logger = this.container.logger;
    let minLogLevel = _.get(declaration, 'options.logLevel', 'info');
    this.logger.addTransport(new StdoutTransport(minLogLevel));

    // check based on schema 
    // XXX: move to heta-build.js ?
    let validate = ajv.compile(declarationSchema);
    let valid = validate(declaration);
    if (!valid) {
      // convert validation errors to heta errors
      validate.errors.forEach((x) => {
        this.logger.error(`${x.dataPath} ${x.message}`, {type: 'BuilderError'});
      });
      return;
    }

    // file paths
    Object.assign(this, declaration);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, declaration.options.distDir);
    this._metaDirname = path.resolve(coreDirname, declaration.options.metaDir);
    this._logPath = path.resolve(coreDirname, declaration.options.logPath);

    this.logger.info(`Builder initialized in directory "${this._coreDirname}".`);
    if (this.id) this.logger.info(`Platform id: "${this.id}"`);
    
    // index file not found
    let indexFilepath = path.resolve(coreDirname, declaration.importModule.source);
    if (!fs.existsSync(indexFilepath)) {
      this.logger.error(`index file "${indexFilepath}" does not exist.`, {type: 'BuilderError'});
    }
  }

  run(){
    this.logger.info(`Compilation of module "${this.importModule.source}" of type "${this.importModule.type}"...`);
    
    // 1. Parsing
    let ms = new ModuleSystem(this.container.logger);
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    ms.addModuleDeep(absFilename, this.importModule.type, this.importModule);

    // 2. Modules integration
    if (this.options.debug) {
      _.forOwn(ms.moduleCollection, (value) => {
        let relPath = path.relative(this._coreDirname, value.filename + '.json');
        let absPath = path.join(this._metaDirname, relPath);
        let str = JSON.stringify(value.parsed, null, 2);
        fs.outputFileSync(absPath, str);
        this.logger.info(`Meta file was saved to ${absPath}`);
      });
    }
    let queue = ms.integrate();

    // 3. Translation
    this.container.loadMany(queue, false);
    //console.log([...this.container.unitDefStorage]); // XXX: debugging

    // 4. Binding
    this.logger.info('Setting references in elements, total length ' + this.container.length);
    this.container.knitMany();

    // 5. Units checking
    if (this.options.skipUnitsCheck) {
      this.logger.warn('Checking unit\'s skipped as stated in declaration.');
    } else {
      this.logger.info('Checking unit\'s consistency.');
      this.container.checkUnits();
    }

    // 6. Terms checking
    this.logger.info('Checking unit\'s terms.');
    this.container.checkTerms();

    // 7. Exports
    if (this.logger.hasErrors) { // check if errors
      this.logger.warn('Export skipped because of errors in compilation.');
    } else if (this.options.skipExport) {
      this.logger.warn('Exporting skipped as stated in declaration.');
    } else if (this.options.ssOnly) {
      this.logger.warn('"ss only" mode');
      this.exportSSOnly();
    } else {
      this.exportMany();
    }

    // 8.save logs if required
    let createLog = this.options.logMode === 'always' 
      || (this.options.logMode === 'error' && this.container.hetaErrors() > 0);
    if (createLog) {
      switch (this.options.logFormat) {
      case 'json':
        var logs = JSON.stringify(this.container.defaultLogs, null, 2);
        break;
      default: 
        logs = this.container.defaultLogs
          .map(x => `[${x.level}]\t${x.msg}`)
          .join('\n');  
      }

      fs.outputFileSync(this._logPath, logs);
      this.logger.info(`All logs was saved to file: "${this._logPath}"`);
    }
    return;
  }
  exportMany(){
    let exportElements = [...this.container.exportStorage].map((x) => x[1]);
    this.logger.info(`Start exporting to files, total: ${exportElements.length}.`);

    exportElements.forEach((exportItem) => {
      let fullPath = path.resolve(this._distDirname, exportItem.filepath);
      let msg = `Exporting to "${fullPath}" of format "${exportItem.format}"...`;
      this.logger.info(msg);
      exportItem.makeAndSave(this._distDirname);
    });
  }
  exportSSOnly(){
    // create export without putting it to exportStorage
    let exportItem = new this.container.exports['SimSolver'];
    exportItem.container = this.container;
    exportItem.merge({
      format: 'SimSolver',
      filepath: '_julia'
    });

    let fullPath = path.resolve(this._distDirname, exportItem.filepath);
    let msg = `Exporting to "${fullPath}" of format "${exportItem.format}"...`;
    this.logger.info(msg);
    exportItem.makeAndSave(this._distDirname);
  }
}

module.exports = {
  Builder
};
