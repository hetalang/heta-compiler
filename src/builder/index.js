const path = require('path');
const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true }); //.addSchema(declarationSchema);
const { Container, HetaLevelError } = require('../index');
const ModuleSystem = require('../module-system');
const { StdoutTransport } = require('../logger');

/**
 * Auxiliary class for performing compilation and storing a platform's options. 
 * The main purpose is a support of Heta compiler's CLI mode.
 *
 * The main method of the class is {@link Builder#run} which  
 * runs a sequence of compilation steps.
 * 
 * @class Builder
 *
 * @param {Object} declaration - Object representing options for builder,
 *  see [CLI references]{@link https://hetalang.github.io/#/heta-compiler/cli-references}
 *  for more information about the structure.
 * @param {string} coreDirname="." - Path of working directory of a Heta platform. Default: working directory of a shell.
 *
 * @property {Container} container This is the reference to the main platform storage. 
 * @property {Logger} logger Reference to logger object of platform. This object can also be called with `this.container.logger`
 * @property {string} _coreDirname Absolute path of the core directory. Calculated from `coreDirname` parameter.
 * @property {string} _distDirname Absolute path of the directory for exporting files.
 *    Calculated from `declaration.options.distDir` property.
 * @property {string} _metaDirname Absolute path of the directory for storing meta files.
 *    Calculated from `declaration.options.metaDir`.
 * @property {string} _logPath Absolute path of log file.
 *    Calculated from `declaration.options.logPath`.
 * @property ... Other properties inherit from `declaration` object, see 
 *   [CLI references]{@link https://hetalang.github.io/#/heta-compiler/cli-references?id=declaration-file-format}
 */
class Builder {
  constructor(declaration, coreDirname = '.'){
    // create container
    this.container = new Container();

    // set transport and logger
    this.logger = this.container.logger;
    let minLogLevel = declaration.options?.logLevel || 'info';
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
      throw new HetaLevelError('Wrong structure of platform file.');
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
    //let indexFilepath = path.resolve(coreDirname, declaration.importModule.source);
    //if (!fs.existsSync(indexFilepath)) {
    //  this.logger.error(`Index file "${indexFilepath}" does not exist.`, {type: 'BuilderError'});
    //}
  }

  /**
   * The method runs building of a platform declared with `Builder` object.
   * If the execution throws an error platform building will stop.
   * 
   * The sequence of operations is following:
   * 
   * 1. Read and parse platform modules (files).
   * 2. Modules integration. Creation meta files if required.
   * 3. Loading integrated structures into `Platform`.
   * 4. Setting cross-references in platform's elements.
   * 5. Checking circular references in mathematical expressions.
   * 6. Checking circular unitDef references. Checking circular functionDef rferences.
   * 7. Checking left and right side units compatibility for mathematical expressions.
   * 8. Checking unit\'s terms.
   * 9. Export of a platform to series of formats. 
   *    Depending on the declaration file it runs {@link Builder#exportMany} or {@link Builder#exportJuliaOnly}.
   * 10. Saving logs if required
   * 
   * @method Builder#run
   * 
   */
  run(){
    this.logger.info(`Compilation of module "${this.importModule.source}" of type "${this.importModule.type}"...`);
    
    // 1. Parsing
    let fileHandler = (filename) => fs.readFileSync(filename);
    let ms = new ModuleSystem(this.container.logger, fileHandler);
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    ms.addModuleDeep(absFilename, this.importModule.type, this.importModule);

    // 2. Modules integration
    if (this.options.debug) {
      Object.getOwnPropertyNames(ms.moduleCollection).forEach((name) => {
        let relPath = path.relative(this._coreDirname, name + '.json');
        let absPath = path.join(this._metaDirname, relPath);
        let str = JSON.stringify(ms.moduleCollection[name], null, 2);
        fs.outputFileSync(absPath, str);
        this.logger.info(`Meta file was saved to ${absPath}`);
      });
    }
    let qArr = ms.integrate();

    // 3. Translation
    this.container.loadMany(qArr, false);

    // 4. Binding
    this.logger.info('Setting references in elements, total length ' + this.container.length);
    this.container.knitMany();

    // 5. Circular start_ and ode_
    this.logger.info('Checking for circular references in Records.');
    this.container.checkCircRecord();

    // 6. check circ UnitDef & FunctionDef
    this.container.checkCircUnitDef();
    this.container.checkCircFunctionDef();

    // === STOP if errors ===
    if (!this.logger.hasErrors) {

      // 7. Units checking
      if (this.options.unitsCheck) {
        this.logger.info('Checking unit\'s consistency.');
        this.container.checkUnits();
      } else {
        this.logger.warn('Units checking skipped. To turn it on set "unitsCheck: true" in declaration.');
      }

      // 8. Terms checking
      this.logger.info('Checking unit\'s terms.');
      this.container.checkTerms();

      // 9. Exports
      if (this.options.skipExport) {
        this.logger.warn('Exporting skipped as stated in declaration.');
      } else if (this.options.juliaOnly) {
        this.logger.warn('"Julia only" mode');
        this.exportJuliaOnly();
      } else {
        this.exportMany();
      }
    } else {
      this.logger.warn('Units checking and export were skipped because of errors in compilation.');
    }

    // 10. save logs if required
    let hetaErrors = this.container.hetaErrors();
    let createLog = this.options.logMode === 'always' 
      || (this.options.logMode === 'error' && hetaErrors.length > 0);
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

  /**
   * Run exporting of files based on components of `this.container.exportArray`.
   * 
   * @method Builder#exportMany
   */
  exportMany(){
    let exportElements = this.container.exportArray;
    this.logger.info(`Start exporting to files, total: ${exportElements.length}.`);

    exportElements.forEach((exportItem) => _makeAndSave(exportItem, this._distDirname));
  }

  /**
   * Run exporting of files for Julia only.
   * It was created to support HetaSimulator.jl package.
   * 
   * @method Builder#exportJuliaOnly
   */
  exportJuliaOnly(){
    // create export without putting it to exportArray
    let Julia = this.container.classes['Julia'];
    let exportItem = new Julia({
      format: 'Julia',
      filepath: '_julia'
    });

    _makeAndSave(exportItem, this._distDirname);
  }
}

function _makeAndSave(exportItem, pathPrefix){
  let logger = exportItem._container.logger;
  let absPath = path.resolve(pathPrefix, exportItem.filepath);
  let msg = `Exporting to "${absPath}" of format "${exportItem.format}"...`;
  logger.info(msg);

  exportItem.make().forEach((out) => {
    let filePath = [absPath, out.pathSuffix].join('');
    try {
      fs.outputFileSync(filePath, out.content);
    } catch (err) {
      let msg =`Heta compiler cannot export to file: "${err.path}": ${err.message}`;
      logger.error(msg, {type: 'ExportError'});
    }
  });
}

module.exports = {
  Builder
};
