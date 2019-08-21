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
const _Module = require('../module-system/_module');
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
  importAsync(callback){
    logger.info(`Importing module "${this.importModule.filename}" of type "${this.importModule.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, this.importModule.filename);
    // use module from importModule property
    // err : first error in importing
    ms.addModuleDeepAsync(absFilename, this.importModule.type, this.importModule.options, (err) => {
      if(err){
        this.errorCatcher(err, `Module "${absFilename}" will be skipped.`);
      }else{
        try{
          ms.integrate()
            .forEach((q) => {
              try{
                this.container.load(q);
              }catch(e){
                this.errorCatcher(e, 'The element will be skipped.');
              }
            });
        }catch(integrationError){
          this.errorCatcher(integrationError, `Module "${absFilename}" will be skipped.`);
        }
      }
      // it should be not here but in runAsync()
      logger.info('Setting references in elements, total length ' + this.container.length);
      try{
        this.container.setReferences();
      }catch(referenceError){
        this.errorCatcher(referenceError, 'Bad reference.');
      }
      callback(null);
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
      (cb) => this.importAsync(cb),
      (cb) => this.exportManyAsync(cb)
    ], (err) => {
      if(err) { // internal errors
        callback(err);
      }else if(this.errorFlag){ // check platform level errors
        callback(new Error('Errors when Builder run. See logs.'));
      }else{ // no errors
        callback(null);
      }
    });
  }
  // analyze different errors
  errorCatcher(error, builderMessage = ''){
    // all errors throws
    let debuggingMode = this.options && this.options.debuggingMode;
    if(debuggingMode) throw error;

    // all errors to logs
    this.errorFlag = true;
    logger.error(`[${error.name}] ${error.message} \n\t=> ${builderMessage}`);
  }
}

module.exports = Builder;
