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
   * Loads platform modules and integrates include dependencies into one Q-array.
   * 
   * @class ModuleSystem
   *
   * @param {Logger} logger Logger used for module diagnostics.
   * @param {Function} fileReadHandler Reads module content by filename.
   * 
   * @property {object<string,_Module>} moduleCollection Map-like storage for modules keyed by `filename#sheet`.
   * @property {TopoSort} graph Include dependency graph.
   * @property {Logger} logger Logger used for module diagnostics.
   * @property {_Module} _top Top-level parsed module.
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
   * Loads a top-level module and its include tree.
   * 
   * @param {string} rawModulePath Relative or absolute module path.
   * @param {string} type Module type: `heta`, `json`, `md`, `yaml`, `xlsx`, `sbml`, or `table`.
   * @param {object} options Loader options.
   * 
   * @returns {_Module} Parsed top-level module.
   */
  addModuleDeep(rawModulePath, type, options = {}){
    let modulePath = path.normalize(rawModulePath);
    let parsed = this._addModuleDeep(modulePath, type, options);
    this._top = parsed;
    
    return parsed;
  }
 
  /**
   * Recursively loads a module and its includes.
   * 
   * @param {string} modulePath Module path.
   * @param {string} type Module type.
   * @param {object} options Loader options.
   * 
   * @returns {_Module|undefined} Parsed module, or `undefined` if it was already loaded.
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
   * Parses one module file and registers its direct includes.
   * 
   * @param {string} filename Module filename.
   * @param {string} type Module type.
   * @param {object} options Loader options.
   * 
   * @returns {_Module} Parsed module.
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

  /**
   * Parses one module file with the loader selected by `type`.
   *
   * @param {string} filename Module filename.
   * @param {string} type Module type.
   * @param {object} options Loader options.
   *
   * @returns {_Module} Parsed module, or an empty module when a recoverable error is logged.
   */
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
        let msg = e.message + ` when converting module "${filename}${tabNum}"`;
        this.logger.error(msg, {type: 'ModuleError', filename: filename});
        return [];
      } else if (e.code === 'ENOENT') {
        let msg = e.message;
        this.logger.error(msg, {type: 'ModuleError', filename: filename});
        return [];
      } else if (e instanceof TypeError) {
        this.logger.error(e.message, {type: 'ModuleError', filename: filename});
        return [];
      } else {
        throw e;
      }
    }

    return parsed;
  }
  
  /**
   * Sorts module ids by include dependencies.
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
   * Composes parsed modules into one integrated Q-array.
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
 * Applies include-level modifiers to every Q-object from an included module.
 *
 * The include action fields (`action`, `id`, `source`, `type`, `sheet`, `class`)
 * are removed before the remaining properties are merged into included objects.
 * 
 * @param {object} obj Include Q-object with modifiers.
 * @param {object[]} arr Q-array to modify.
 * 
 * @returns {object[]} Modified Q-array.
 */
function compose(obj, arr = []) {
  let {action, id, source, type, sheet, ...cleanedObj} = obj;
  delete cleanedObj.class;

  return arr.map((x) => {
    return Object.assign({}, cloneDeep(x), cleanedObj);
  });
}

module.exports = ModuleSystem;
