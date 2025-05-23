const path = require('path');
const TopoSort = require('@insysbio/topo-sort');
const { cloneDeep } = require('../utils');
const HetaLevelError = require('../heta-level-error');

// module loaders
const hetaLoader = require('./heta-module');
const jsonLoader = require('./json-module');
const mdLoader = require('./md-module');
const yamlLoader = require('./yaml-module');
const tableLoader = require('./table-module');
const sbmlLoader = require('./sbml-module');
const moduleLoaders = {
  heta: hetaLoader,
  json: jsonLoader,
  md: mdLoader,
  yaml: yamlLoader,
  xlsx: tableLoader,
  table: tableLoader,
  sbml: sbmlLoader,
};

class ModuleSystem {
  /**
   * Object storing Heta modules and methods to combine them.
   * 
   * @param {Logger} logger Object to analyze log events.
   * 
   * @property {object<string,_Module>} moduleCollection Map-like storage for modules.
   *     Key is a file id (filename), value is a `Module`.
   * @property {TopoSort} graph An instance of `TopoSort` class borrowed from *topo-sort* package.
   * @property {Logger} logger Object to analyze log events.
   * @property {_Module} _top Top-level module. Usually created from `index.heta` file.
   */
  constructor(logger, fileReadHandler){
    // stores modules in format
    // { filepath : module, ...}
    this.moduleCollection = {};
    this.graph = new TopoSort();
    this.logger = logger;
    this.fileReadHandler = fileReadHandler;
  }
  
  /**
   * Load top-level module to `ModuleSystem`.
   * 
   * @param {string} rawAbsFilePath Relative or absolute module path.
   * @param {string} type A module type.
   * @param {object} options additional options.
   * 
   * @returns {_Module} Created module.
   */
  addModuleDeep(rawModulePath, type, options = {}){
    let modulePath = path.normalize(rawModulePath);
    let parsed = this._addModuleDeep(modulePath, type, options);
    this._top = parsed;
    
    return parsed;
  }
 
  /**
   * It scan module dependence recursively.
   * 
   * @param {string} modulePath Absolute module path.
   * @param {string} type A module type.
   * @param {object} options additional options.
   * 
   * @returns {_Module} Created module.
   */
  _addModuleDeep(modulePath, type, options = {}){
    let moduleName = [modulePath, '#', options.sheet || '0'].join('');
    if (!(moduleName in this.moduleCollection)) { // new file
      let parsed = this.addModule(modulePath, type, options);
      parsed
        .filter((q) => q.action==='include')
        .forEach((importItem) => {
          this._addModuleDeep(importItem.source, importItem.type, importItem);
        });
      
      return parsed;
    } else { // if file already in moduleCollection do nothing
      return;
    }
  }

  /**
   * Parse single file without dependencies.
   * 
   * @param {string} filename File path of module file.
   * @param {string} type A module type.
   * @param {object} options additional options.
   * 
   * @returns {_Module} Created module.
   */
  addModule(filename, type = 'heta', options = {}){
    // parse
    let parsed = this.createModule(filename, type, options);

    // update by abs paths
    let absDirPath = path.dirname(filename);

    // push to moduleCollection
    let moduleName = [filename, '#', options.sheet || '0'].join('');
    this.moduleCollection[moduleName] = parsed;
    // set in graph
    let includePaths = parsed
      .filter((q) => q.action==='include')
      .filter((q) => {
        if (path.isAbsolute(q.source)) {
          this.logger.error(
            `include statement does not suport absolute path in "${filename}", got "${q.source}".`,
            {type: 'ModuleError', filename: filename}
          );
          q.source = '';
          return false;
        }
        // update source
        q.source = path.join(absDirPath, q.source);
        return true;
      })
      .map((x) => [x.source, '#', x.sheet || 0].join(''));
    this.graph.add(moduleName, includePaths);

    return parsed;
  }

  createModule(filename, type, options = {}) {
    let tabNum = options.sheet !== undefined ? ('#' + options.sheet) : ''; // for xlsx only
    this.logger.info(`Reading module of type "${type}" from file "${filename}${tabNum}"...`);

    if (!filename) { // in case of empty filename or absolute path
      //this.logger.error(`No filename set for include of type "${type}"`, {type: 'ModuleError', filename: filename});
      return [];
    }

    // run loader
    let loader = moduleLoaders[type];
    if (loader === undefined) {
      let msg = `Unknown module type "${type}". Possible types are: ["heta", "json", "md", "yaml", "xlsx", "sbml", "table"].`;
      this.logger.error(msg, {type: 'ModuleError', filename: filename});
      return [];
    }
    if (typeof loader !== 'function') {
      throw new Error(`Module loader must be a function, got "${typeof loader}"`);
    }
    
    try {
      let fileContent = this.fileReadHandler(filename);
      var parsed = loader(fileContent, options);
    } catch (e) {
      if (e.name === 'HetaLevelError') {
        let msg = e.message + ` when converting module "${filename}"`;
        this.logger.error(msg, {type: 'ModuleError', filename: filename});
        return [];
      } else if (e.code === 'ENOENT') {
        let msg = e.message;
        this.logger.error(msg, {type: 'ModuleError', filename: filename});
        return [];
      } else {
        throw e;
      }
    }

    return parsed;
  }
  
  /**
   * Sort modules before integration. If there is circular references then throw an error.
   * 
   * @returns {string[]} Array of modules ids.
   */
  sortedPaths(){
    try {
      return this.graph.sort();
    } catch (error) {
      throw new HetaLevelError(`Circular include in modules: [ ${error.circular.join(', ')} ]`);
    }
  }

  /**
   * Composes parsed modules into single platform.
   * 
   * @returns {object[]} integrated Q-array.
   */
  integrate(){
    this
      .sortedPaths()
      .reverse()
      .map((y) => {
        return this.moduleCollection[y];
      }).forEach((x) => {
        x._integrated = x.reduce((acc, current) => {
          if(current.action==='include'){
            let moduleName = [current.source, '#', current.sheet || '0'].join('');
            let childIntegrated = this.moduleCollection[moduleName]._integrated;
            let composition = compose(current, childIntegrated);
            acc = acc.concat(composition);
          } else {
            acc.push(current);
          }
          return acc;
        }, []);
      });
    return this._top._integrated;
  }
}

/**
 * Method that set merging of Heta elements.
 * 
 * @param {object} obj This should be merged.
 * @param {object[]} arr Array to merge.
 * 
 * @returns {object} merged Q-array.
 */
function compose(obj, arr = []) {
  let {action, id, source, type, sheet, ...cleanedObj} = obj;
  delete cleanedObj.class;

  return arr.map((x) => {
    return Object.assign({}, cloneDeep(x), cleanedObj);
  });
}

module.exports = ModuleSystem;
