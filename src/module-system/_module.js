const path = require('path');

// abstract class for different import types
class _Module{
  // constructor with type selection
  static createModule(filepath, type){
    let mdl = new _Module;
    mdl.filename = path.resolve(filepath); // get abs path

    switch(type){
      case 'heta':
        mdl.setHetaModule(filepath);
        break;
      case 'json':
        mdl.setJSONModule(filepath);
        break;
      case 'yml':
        mdl.setYAMLModule(filepath);
        break;
      case 'xlsx':
        mdl.setXLSXModule(filepath);
        break;
      default:
        throw new TypeError(`Unknown type "${type}" for file "${filepath}" `);
    }

    mdl.updateByAbsPaths();

    return mdl;
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
