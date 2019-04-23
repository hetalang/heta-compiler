const path = require('path');
const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true });//.addSchema(declarationSchema);
const { SchemaValidationError, HetaError } = require('../heta-error');
const semver = require('semver'); // for future check of buildVersion
const { version } = require('../../package');
const Container = require('../container');
const ModuleSystem = require('../module-system');
const winston = require('winston');
const { _Export } = require('../core/_export');
const async = require('async');

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

class Builder{
  constructor(decl, coreDirname='.', distDirname = 'dist', metaDirname = 'meta'){
    // check based on schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(decl);
    if(!valid) {
      let error = new SchemaValidationError(validate.errors, 'Builder');
      this.errorCatcher(error, 'Builder is not created.');
      throw error;
    }

    // update logger
    logger.level = decl.options.logLevel;

    // version check
    let satisfiesVersion = semver.satisfies(version, decl.builderVersion);
    if(!satisfiesVersion){
      let error = new HetaError(`Version of declaration file "${decl.builderVersion}" does not satisfy current builder.`);
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
  importManyAsync(callback){
    let notIgnoredImports = this.importModules.filter((importItem) => !importItem.ignore);
    logger.info(`Start importing of modules, total: ${notIgnoredImports.length}.`);
    async.each(notIgnoredImports, (importItem, cb) => this.importAsync(importItem, cb), (err) => {
      logger.info('Import finished.');
      callback(err);
    });
  }
  importAsync(importItem, callback){
    logger.info(`Importing module "${importItem.filename}" of type "${importItem.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, importItem.filename);

    ms.addModuleDeepAsync(absFilename, importItem.type, (err, arr) => {
      if(err){
        this.errorCatcher(err, `Module "${importItem.filename}" will be skipped.`);
        callback(null);
      }else{
        arr = ms.integrate(); // TODO: try/catch required
        arr.forEach((q) => {
          try{
            this.container.load(q);
          }catch(e){
            this.errorCatcher(e, 'The element will be skipped.');
          }
        });
        callback(null);
      }
    });
  }
  exportManyAsync(callback){
    if(!this.options.skipExport){
      let exportElements = [...this.container.storage]
        .filter((obj) => obj[1] instanceof _Export)
        .map((obj) => obj[1]);
      logger.info(`Start exporting to files, total: ${exportElements.length}.`);
      async.each(exportElements, (exportItem, cb) => {
        logger.info(`Exporting to file "${exportItem.id}" of type "${exportItem.className}"...`);
        let absFilename = path.join(this._distDirname, exportItem.id + '.' + exportItem.ext);
        try{
          let codeText = exportItem.do();
          fs.outputFileSync(absFilename, codeText);
        }catch(e){
          this.errorCatcher(e, 'Export will be skipped.');
        }
        cb(null);
      }, (err) => {
        logger.info('Exporting finished.');
        callback(err);
      });
    }else{
      logger.warn('Exporting skipped as stated in declaration.');
      callback(null);
    }
  }
  // starts async build
  runAsync(callback){
    this.errorFlag = false; // reset platform level errors
    async.waterfall([
      (cb) => this.importManyAsync(cb),
      (cb) => this.exportManyAsync(cb)
    ], (err) => {
      if(err) { // internal errors
        callback(err);
      }else if(this.errorFlag){ // check platform level errors
        callback(new Error('Errors when Builder run.'));
      }else{ // no errors
        callback(null);
      }
    });
  }
  // sync run, not used
  run(callback){
    this.errorFlag = false;
    logger.info(`Start importing of modules, total: ${this.importModules.length}.`);
    this.importModules.forEach((importItem) => {
      this.import(importItem);
    });
    logger.info('Importing finished.');

    if(!this.options.skipExport){
      let exportElements = [...this.container.storage]
        .filter((obj) => obj[1] instanceof _Export)
        .map((obj) => obj[1]);
      logger.info(`Start exporting to files, total: ${exportElements.length}.`);
      exportElements.forEach((exportItem) => {
        try{
          logger.info(`Exporting to file "${exportItem.id}" of type "${exportItem.className}"...`);
          let absFilename = path.join(this._distDirname, exportItem.id + '.' + exportItem.ext);
          let codeText = exportItem.do();
          fs.outputFileSync(absFilename, codeText);
        }catch(e){
          this.errorCatcher(e, 'Export will be skipped.');
        }
      });
      logger.info('Exporting finished.');
    }else{
      logger.warn('Exporting skipped because of options.');
    }

    if(this.errorFlag){
      let e = new Error('Critical errors when run.');
      callback(e);
    }else{
      callback(null);
    }
  }
  // sync import, not used
  import(importItem){
    logger.info(`Importing module "${importItem.filename}" of type "${importItem.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, importItem.filename);
    let arr = [];
    try{
      ms.addModuleDeep(absFilename, importItem.type);
      arr = ms.integrate();
    }catch(e){
      this.errorCatcher(e, `Module "${importItem.filename}" will be skipped.`);
    }

    arr.forEach((q) => {
      try{
        this.container.load(q);
      }catch(e){
        this.errorCatcher(e, `The element with id:"${q.id}" space:"${q.space}" will be skipped.`);
      }
    });
    // debugging
    //let j1 = JSON.stringify(arr, null, 2);
    //let j2 = JSON.stringify(this.container.toQArr(), null, 2);
    //logger.debug(j1);

    return this;
  }
  // analyze different errors
  errorCatcher(error, builderMessage = ''){
    // all errors throws
    let debuggingMode = this.options && this.options.debuggingMode;
    if(debuggingMode) throw error;

    // all errors to logs
    this.errorFlag = true;
    if(error instanceof HetaError || error.name === 'SyntaxError'){
      logger.error(`[${error.name}] ${error.logMessage()} \n\t${builderMessage}`);
    }else{
      logger.error(`[${error.name}] ${error.message} \n\t${builderMessage}`);
    }
  }
}

module.exports = Builder;
