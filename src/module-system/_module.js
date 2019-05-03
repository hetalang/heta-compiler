const path = require('path');

// abstract class for different import types
class _Module{
  static createModuleAsync(filename, type, options = {}, callback){
    let mdl = new _Module;
    mdl.filename = path.resolve(filename); // get abs path
    mdl.type = type;
    mdl.options = options;
    
    switch(type){
      case 'heta':
        mdl.setHetaModuleAsync(callback);
        break;
      case 'json':
        mdl.setJSONModuleAsync(callback);
        break;
      case 'yml':
        mdl.setYAMLModuleAsync(callback);
        break;
      case 'xlsx':
        mdl.setXLSXModuleAsync(callback);
        break;
      default:
        callback(new TypeError(`Unknown type "${type}" for file "${filename}" `));
    }
  }
  getImportElements(){
    return this.parsed
      .filter((simple) => simple.action==='import');
  }
  // replace relative paths by absolute ones
  updateByAbsPaths(){
    let absDirPath = path.dirname(this.filename);
    this.getImportElements()
      .forEach((simple) => simple.source = path.resolve(absDirPath, simple.source));
  }
}

module.exports = _Module;
