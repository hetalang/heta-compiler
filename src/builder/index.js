const path = require('path');
const fs = require('fs-extra');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true });//.addSchema(declarationSchema);
const { SchemaValidationError } = require('../validation-error');
const semver = require('semver'); // for future check of buildVersion
const { version } = require('../../package');
const Container = require('../container');
const ModuleSystem = require('../module-system');
const winston = require('winston');

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
      throw new SchemaValidationError(validate.errors, 'Builder');
    }

    // update logger
    logger.level = decl.options.logLevel;

    // verssion check
    let satisfiesVersion = semver.satisfies(version, decl.builderVersion);
    if(!satisfiesVersion){
      let errMessage = `Version of declaration file "${decl.builderVersion}" does not satisfy current builder.`;
      logger.error(errMessage);
      throw new Error(errMessage);
    }
    // assignments
    Object.assign(this, decl);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, distDirname);
    this._metaDirname = path.resolve(coreDirname, metaDirname);

    // create container
    this.container = new Container();
    logger.info(`Builder initialized with directory "${this._coreDirname}".`);
  }
  // starts async build
  run(callback){
    let errorFlag = false;
    logger.info(`Start importing of modules, total: ${this.imports.length}.`);
    this.imports.forEach((importItem) => this.import(importItem));
    logger.info('Importing finished.');
    logger.info(`Start exporting to files, total: ${this.exports.length}.`);
    this.exports.forEach((exportItem) => {
      try{
        this.export(exportItem);
      }catch(e){
        errorFlag = true;
        this.errorCatcher(e);
      }
    });
    logger.info('Exporting finished.');
    if(errorFlag){
      let e = new Error('Critical errors when build, see logs.');
      callback(e);
    }else{
      callback(null);
    }
  }
  // import
  import(importItem){
    logger.info(`Importing module "${importItem.filename}" of type "${importItem.type}"...`);
    let ms = new ModuleSystem();
    let absFilename = path.join(this._coreDirname, importItem.filename);
    let arr = [];
    try{
      ms.addModuleDeep(absFilename, importItem.type);
      arr = ms.integrate();
    }catch(e){
      this.errorCatcher(e);
    }

    arr.forEach((q) => {
      try{
        this.container.load(q);
      }catch(e){
        this.errorCatcher(e);
      }
    });
    // debugging
    let j1 = JSON.stringify(arr, null, 2);
    let j2 = JSON.stringify(this.container.toQArr(), null, 2);
    logger.debug(j1);

    return this;
  }
  export(exportItem){
    logger.info(`Exporting to file "${exportItem.filename}" of type "${exportItem.format}"...`);
    let absFilename = path.join(this._distDirname, exportItem.filename);
    let model = this.container.storage.get(exportItem.model); // required get method
    if(model===undefined){
      throw new Error(`Required model "${exportItem.model}" is not found in container and will not be exported.`);
    }
    let SBMLText = model.toSBML();
    fs.outputFileSync(absFilename, SBMLText);
  }
  errorCatcher(error){
    logger.error(`[${error.name}] ${error.message}`);
    if(this.options.debuggingMode) throw error;
  }
}

module.exports = Builder;
