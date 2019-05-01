const path = require('path');

// abstract class for different import types
class _Module{
  constructor(filename){
    this.filename = path.resolve(filename); // get abs path
  }
  getImportElements(){
    return this.parsed
      .filter((simple) => simple.action==='import');
  }
  updateByAbsPaths(){
    let absDirPath = path.dirname(this.filename);
    this.parsed // replace relative paths by absolute ones
      .filter((simple) => simple.action==='import')
      .forEach((simple) => simple.source = path.resolve(absDirPath, simple.source));
  }
}

module.exports = _Module;
