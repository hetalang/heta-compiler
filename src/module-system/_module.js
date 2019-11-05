const path = require('path');

// abstract class for different import types
class _Module{
  static createModuleAsync0(filename, type, options = {}, callback){
    if(typeof callback!=='function') throw TypeError('callback function should be set.');
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
      case 'md':
        mdl.setMdModuleAsync(callback);
        break;
      case 'yml':
        mdl.setYAMLModuleAsync(callback);
        break;
      case 'xlsx':
        mdl.setXLSXModuleAsync(callback);
        break;
      default:
        callback(new TypeError(`Unknown type "${type}" for file "${filename}" `));
        break;
    }
  }
  static async createModuleAsync(filename, type, options = {}){
    let mdl = new _Module;
    mdl.filename = path.resolve(filename); // get abs path
    mdl.type = type;
    mdl.options = options;

    switch(type){
      case 'heta':
        await mdl.setHetaModuleAsync();
        break;
      case 'json':
        await mdl.setJSONModuleAsync();
        break;
      case 'md':
        await mdl.setMdModuleAsync();
        break;
      case 'yml':
        await mdl.setYAMLModuleAsync();
        break;
      case 'xlsx':
        await mdl.setXLSXModuleAsync();
        break;
      default:
        throw new TypeError(`Unknown type "${type}" for file "${filename}" `);
        break;
    }
    
    return mdl;
  }
  getImportElements(){
    return this.parsed
      .filter((component) => component.action==='import');
  }
  // replace relative paths by absolute ones
  updateByAbsPaths(){
    let absDirPath = path.dirname(this.filename);
    this.getImportElements()
      .forEach((component) => component.source = path.resolve(absDirPath, component.source));
  }
}

module.exports = _Module;
