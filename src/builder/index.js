const path = require('path');
//const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true }); //.addSchema(declarationSchema);
const semver = require('semver');
const { version } = require('../../package');
const Container = require('../container');
const ModuleSystem = require('../module-system');
const winston = require('winston');
const coreComponents = require('../core-components');

class BuilderError extends Error {
  constructor(diagnostics = [], message, filename, lineNumber){
    let indexedMessage = `${message}\n`
      + diagnostics
        .map((x, i) => `\t${i+1}. ${x.dataPath} ${x.message}`)
        .join('\n');
    super(indexedMessage, filename, lineNumber);
  }
}
BuilderError.prototype.name = 'BuilderError';

let logger = winston.createLogger({
  //level: logLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.align(),
    winston.format.simple()
    //winston.format.printf((info) => `[${info.level}]: ${info.message}`)
  ),
  transports: [
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

class Builder {
  constructor(decl, coreDirname='.', distDirname = 'dist', metaDirname = 'meta'){
    // check based on schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(decl);
    if(!valid) {
      let error = new BuilderError(validate.errors, 'Wrong platform file:');
      this.errorCatcher(error, 'Builder is not created.');
      throw error;
    }

    // update logger
    logger.level = decl.options.logLevel;

    // version check
    let satisfiesVersion = semver.satisfies(version, decl.builderVersion);
    if(!satisfiesVersion){
      let error = new BuilderError([], `Version of declaration file "${decl.builderVersion}" does not satisfy current builder.`);
      this.errorCatcher(error);
      throw error;
    }
    // assignments
    Object.assign(this, decl);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, distDirname);
    this._metaDirname = path.resolve(coreDirname, metaDirname);

    // create container
    this.container = new Container();
    logger.info(`Builder initialized in directory "${this._coreDirname}".`);
  }
  async compileAsync(){
    logger.info(`Compilation of module "${this.importModule.source}" of type "${this.importModule.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    
    // 0. Load core components
    logger.info('Loading core components, total count: ' + coreComponents.length);
    this.container.loadMany(coreComponents);

    // 1. Parsing
    await ms.addModuleDeepAsync(absFilename, this.importModule.type, this.importModule);
    // 2. Modules integration
    let queue = ms.integrate();
    // 3. Translation
    queue.forEach((q) => {
      try{
        this.container.load(q);
      }catch(validationError){
        this.errorCatcher(validationError, 'The element will be skipped.');
      }
    });
    // 4. Binding TODO: population must be when exported
    logger.info('Setting references in elements, total length ' + this.container.length);
    this.container.populate();
  }
  async exportManyAsync(){
    if(!this.options.skipExport){
      let exportElements = [...this.container.storage]
        .filter((obj) => obj[1].instanceOf('_Export'))
        .map((obj) => obj[1]);
      logger.info(`Start exporting to files, total: ${exportElements.length}.`);

      let tmp = exportElements.map(async (exportItem) => {
        logger.info(`Exporting "${exportItem.index}" component of type "${exportItem.className}"...`);
        try{
          exportItem.makeAndSave(this._distDirname);
        }catch(e){
          this.errorCatcher(e, 'Export will be skipped.');
        }
      });
      await Promise.all(tmp);
    }else{
      logger.warn('Exporting skipped as stated in declaration.');
    }
  }
  // starts async build
  async runAsync(){
    this.errorFlag = false; // reset platform level errors
    let absFilename = path.join(this._coreDirname, this.importModule.source);
    // Compilation steps
    await this.compileAsync().catch((error) => {
      this.errorCatcher(error, `Module "${absFilename}" was not compiled properly.`);
    });
    // Other steps
    await this.exportManyAsync().catch((error) => {
      this.errorCatcher(error, `Some of files was not exported.`);
    });
    
    if(this.errorFlag) // check platform level errors
      throw new Error('Errors when Builder run. See logs.');
    return;
  }
  // analyze different errors
  // currently only errors from load()
  errorCatcher(error, builderMessage = ''){
    // all errors throws
    let debuggingMode = this.options && this.options.debuggingMode;
    // all errors to logs
    this.errorFlag = true;
    logger.error(`[${error.name}] ${error.message} \n\t=> ${builderMessage}`);

    if (debuggingMode) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = {
  Builder, 
  BuilderError
};
