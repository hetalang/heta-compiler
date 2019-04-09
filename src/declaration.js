const path = require('path');
// const semver = require('semver'); // for future check of buildVersion

class Declaration{
  constructor(decl, coreDirname='.', distDirname = 'dist', metaDirname = 'meta'){
    Object.assign(this, decl);
    this._coreDirname = path.resolve(coreDirname);
    this._distDirname = path.resolve(coreDirname, distDirname);
    this._metaDirname = path.resolve(coreDirname, metaDirname);
  }
  // starts async build
  run(callback){
    callback(null);
  }
  // start sync build
  runSync(){

  }
}

module.exports = Declaration;
