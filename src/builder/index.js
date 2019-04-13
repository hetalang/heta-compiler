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
const { _Export } = require('../core/_export');

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

    logger.info(`Start importing of modules, total: ${this.importModules.length}.`);
    this.importModules.forEach((importItem) => this.import(importItem));
    logger.info('Importing finished.');

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
        errorFlag = true;
        this.errorCatcher(e, 'Export will be skipped.');
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
      this.errorCatcher(e, 'Module will be skipped.');
    }

    arr.forEach((q) => {
      try{
        this.container.load(q);
      }catch(e){
        this.errorCatcher(e, 'Element will be skipped.');
      }
    });
    // debugging
    let j1 = JSON.stringify(arr, null, 2);
    let j2 = JSON.stringify(this.container.toQArr(), null, 2);
    logger.debug(j1);

    return this;
  }
  errorCatcher(error, builderMessage = ''){
    logger.error(`[${error.name}] ${error.message} ${builderMessage}`);
    if(this.options.debuggingMode) throw error;
  }
}

module.exports = Builder;
