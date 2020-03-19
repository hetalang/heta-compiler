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
  constructor(decl, coreDirname='.', distDir, metaDirname = 'meta'){
    // set logger
    this.logger = new Logger();

    // check based on schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(decl);
    if(!valid) {
      // convert validation errors to heta errors
      validate.errors.forEach((x) => {
        this.logger.error(`${x.dataPath} ${x.message}`, 'BuilderError');
      });
      throw new Error('Builder is not created. See logs.');
    }

    // version check and throws
    let satisfiesVersion = semver.satisfies(version, decl.builderVersion);
    if(!satisfiesVersion){
      this.logger.error(`Version of declaration file "${decl.builderVersion}" does not satisfy current builder.`, 'BuilderError');
      throw new Error('Builder is not created. See logs.');
    }
    // assignments
    Object.assign(this, decl);
    this._coreDirname = path.resolve(coreDirname);
    let distDirname = distDir || decl.options.distDir;
    this._distDirname = path.resolve(coreDirname, distDirname);
    this._metaDirname = path.resolve(coreDirname, metaDirname);

    // create container
    this.container = new Container();
    this.logger.info(`Builder initialized in directory "${this._coreDirname}".`);
  }
  async runAsync(){
    this.logger.info(`Compilation of module "${this.importModule.source}" of type "${this.importModule.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    
    // 0. Load core components
    this.logger.info('Loading core components, total count: ' + coreComponents.length);
    this.container.loadMany(coreComponents, true);
    this.logger.pushMany(this.container.logger);

    // 1. Parsing
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
    await this.exportManyAsync();
    
    return;
  }
  async exportManyAsync(){
    if(!this.options.skipExport){
      let exportElements = this.container
        .toArray()
        .filter((obj) => obj.instanceOf('_Export'));
      this.logger.info(`Start exporting to files, total: ${exportElements.length}.`);

      let tmp = exportElements.map(async (exportItem) => {
        this.logger.info(`Exporting "${exportItem.index}" component of type "${exportItem.className}"...`);
        try{
          exportItem.makeAndSave(this._distDirname);
        }catch(e){
          this.logger.error(e.message, 'ExportError');
        }
      });
      await Promise.all(tmp);
    }else{
      this.logger.warn('Exporting skipped as stated in declaration.');
    }
  }
}

module.exports = {
  Builder
};
