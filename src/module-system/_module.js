const path = require('path');
const { ModuleError } = require('../heta-error');

// abstract class for different import types
class _Module {
  static createModule(filename, type, options = {}){
    let mdl = new _Module;
    mdl.filename = path.resolve(filename); // get abs path
    mdl.type = type;
    mdl.options = options;

    switch (type) {
    case 'heta':
      mdl.setHetaModule();
      break;
    case 'json':
      mdl.setJSONModule();
      break;
    case 'md':
      mdl.setMdModule();
      break;
    case 'yaml':
      mdl.setYAMLModule();
      break;
    case 'xlsx':
      mdl.setXLSXModule();
      break;
    case 'sbml':
      mdl.setSBMLModule();
      break;
    default:
      throw new ModuleError(`Unknown type "${type}" for source "${filename}". Possible types are: ["heta", "json", "md", "yaml", "xlsx"] `);
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
