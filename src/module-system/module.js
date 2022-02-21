const path = require('path');
const fs = require('fs');

/**
 * Abstract class representing general Heta module.
 * 
 * @class _Module
 * 
 * @property {object[]} parsed Q-array.
 * @property {string} filename File name (absolute) associated with the module.
 * @property {Logger} logger Object to analyze log events.
 * @property {string} type One of module types: heta, json, yaml, xlsx, sbml
 * @property {object} options Additional module options.
 */
class _Module {
  /**
   * Constructor to create a module of a specific type.
   * 
   * @param {string} filename Relative or absolute path of a module file.
   * @param {string} type Module type.
   * @param {object} options Additional module options.
   * @param {Logger} logger Object to analyze log events.
   * 
   * @returns {_Module} Created module.
   */
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

    let tabNum = mdl.options.sheet !== undefined ? ('#' + mdl.options.sheet) : ''; // for xlsx only
    mdl.logger.info(`Reading module of type "${type}" from file "${mdl.filename}${tabNum}"...`);
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
    case 'xlsx': // to support older syntax
    case 'table':
      mdl.setTableModule();
      break;
    case 'sbml':
      mdl.setSBMLModule();
      break;
    default:
      let msg = `Unknown module type "${type}". Possible types are: ["heta", "json", "md", "yaml", "xlsx", "sbml", "table"].`;
      mdl.logger.error(msg, {type: 'ModuleError', filename: this.filename});
    }

    if (mdl.parsed.length === 0) {
      mdl.logger.warn(`Nothing is imported from the module: "${mdl.filename}#${tabNum}"...`);
    }

    return mdl;
  }

  /**
   * Select only `#include` actions from the Q-array.
   * 
   * @returns {object[]} Array of `#include actions`.
   */
  getImportElements(){
    return this.parsed
      .filter((q) => q.action==='include');
  }
  
  /**
   * Search for `source` property in `#import` and replace replace relative paths by absolute ones.
   */
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
