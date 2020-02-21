const path = require('path');
const { ModuleError } = require('../heta-error');

// abstract class for different import types
class _Module {
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
      case 'yaml':
        await mdl.setYAMLModuleAsync();
        break;
      case 'xlsx':
        await mdl.setXLSXModuleAsync();
        break;
      case 'sbml':
        await mdl.setSBMLModuleAsync();
        break;
      default:
        throw new ModuleError(`Unknown type "${type}" for source "${filename}". Possible types are: ["heta", "json", "md", "yaml", "xlsx"] `);
        break;
    }
    
    return mdl;
  }
  getImportElements(){
    return this.parsed
      .filter((q) => q.action==='include');
  }
  // replace relative paths by absolute ones
  updateByAbsPaths(){
    let absDirPath = path.dirname(this.filename);
    this.getImportElements().forEach((q) => {
      if(typeof q.source !== 'string')
        throw new ModuleError(`Property "source" in include inside "${this.filename}" must be string, but currently is ${q.source}.`);
      q.source = path.resolve(absDirPath, q.source);
    });
  }
}

module.exports = _Module;
