const path = require('path');
const declarationSchema = require('./declaration-schema');
const Ajv = require('ajv');
const ajv = new Ajv({ useDefaults: true });//.addSchema(declarationSchema);
const { SchemaValidationError } = require('./validation-error');
const semver = require('semver'); // for future check of buildVersion
const { version } = require('../package');
const Container = require('./container');
const winston = require('winston');

class Builder{
  constructor(decl, coreDirname='.', distDirname = 'dist', metaDirname = 'meta'){
    // check based on schema
    let validate = ajv.compile(declarationSchema);
    let valid = validate(decl);
    if(!valid) {
      throw new SchemaValidationError(validate.errors, 'Builder');
    }

    // verssion check
    let satisfiesVersion = semver.satisfies(version, decl.builderVersion);
    if(!satisfiesVersion){
      throw new Error(`Version of declaration file "${decl.builderVersion}" does not satisfy current builder.`);
    }
    // assignments
    Object.assign(this, decl);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, distDirname);
    this._metaDirname = path.resolve(coreDirname, metaDirname);

    // create container
    this.container = new Container();
  }
  // starts async build
  run(callback){
    callback(null);
  }
  // import
  runImports(callback){
    callback(null);
  }
  runExports(callback){
    callback(null);
  }
}

module.exports = Builder;
