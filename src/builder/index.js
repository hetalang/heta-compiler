const path = require('path');
//const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true }); //.addSchema(declarationSchema);
const semver = require('semver');
const { version } = require('../../package');
const Container = require('../container');
const ModuleSystem = require('../module-system');
const coreComponents = require('../core-components');
const Logger = require('../logger');

class Builder {
  constructor(declaration, coreDirname = '.', distDir, metaDir){
    // set logger
    this.logger = new Logger();

    // check based on schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(declaration);
    if(!valid) {
      // convert validation errors to heta errors
      validate.errors.forEach((x) => {
        this.logger.error(`${x.dataPath} ${x.message}`, 'BuilderError');
      });
      throw new Error('Builder is not created. See logs.');
    }

    // version check and throws
    let satisfiesVersion = semver.satisfies(version, declaration.builderVersion);
    if(!satisfiesVersion){
      this.logger.error(`Version of declaration file "${declaration.builderVersion}" does not satisfy current builder.`, 'BuilderError');
      throw new Error('Builder is not created. See logs.');
    }
    // assignments
    Object.assign(this, declaration);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, (distDir || declaration.options.distDir || 'dist'));
    this._metaDirname = path.resolve(coreDirname, (metaDir || declaration.options.metaDir || 'meta'));
 
    // create container
    this.container = new Container();
    this.logger.info(`Builder initialized in directory "${this._coreDirname}".`);
  }
  run(){
    this.logger.info(`Compilation of module "${this.importModule.source}" of type "${this.importModule.type}"...`);
    
    // 0. Load core components
    this.logger.info('Loading core components, total count: ' + coreComponents.length);
    this.container.loadMany(coreComponents, true);
    this.logger.pushMany(this.container.logger);

    // 1. Parsing
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    ms.addModuleDeep(absFilename, this.importModule.type, this.importModule);
    this.logger.pushMany(ms.logger);

    // 2. Modules integration
    let queue = ms.integrate();

    // 3. Translation
    this.container.loadMany(queue, false);

    // 4. Binding
    this.logger.info('Setting references in elements, total length ' + this.container.length);
    this.container.knitMany();
    this.logger.pushMany(this.container.logger);
    
    // 5. Exports
    this.exportMany();
    
    return;
  }
  exportMany(){
    if (!this.options.skipExport) {
      let exportElements = this.container
        .toArray()
        .filter((obj) => obj.instanceOf('_Export'));
      this.logger.info(`Start exporting to files, total: ${exportElements.length}.`);

      exportElements.forEach((exportItem) => {
        let msg = `Exporting "${exportItem.index}" component of type "${exportItem.className}"...`;
        this.logger.info(msg);
        exportItem.makeAndSave(this._distDirname);
        this.logger.pushMany(exportItem.logger);
      });
    } else {
      this.logger.warn('Exporting skipped as stated in declaration.');
    }
  }
}

module.exports = {
  Builder
};
