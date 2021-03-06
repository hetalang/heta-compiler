const path = require('path');
const fs = require('fs');

// abstract class for different import types
class _Module {
  static createModule(filename, type, options = {}, logger){
    let mdl = new _Module;
    mdl.logger = logger;
    mdl.filename = path.resolve(filename); // get abs path
    mdl.type = type;
    mdl.options = options;
    mdl.parsed = []; // default output
    
    //checking file exists
    if (!fs.existsSync(mdl.filename)) {
      mdl.logger.error(`Module file not found: "${mdl.filename}"`, {type: 'FileSystemError', filename: mdl.filename});
      
      return mdl;
    }

    mdl.logger.info(`Reading module of type "${type}" from file "${mdl.filename}"...`);
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
      let msg = `Unknown module type "${type}". Possible types are: ["heta", "json", "md", "yaml", "xlsx", "sbml"].`;
      mdl.logger.error(msg, {type: 'ModuleError', filename: this.filename});
    }

    if (mdl.parsed.length === 0) {
      mdl.logger.warn(`Nothing is imported from file "${mdl.filename}"...`);
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
      if(typeof q.source !== 'string') {
        throw new TypeError(`Property "source" in "${this.filename}" must be string`);
      }
      q.source = path.resolve(absDirPath, q.source);
    });
  }
}

module.exports = _Module;
