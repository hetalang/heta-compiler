const path = require('path');
const _ = require('lodash');
const TopoSort = require('@insysbio/topo-sort');
const _Module = require('./module');
require('./heta-module');
require('./json-module');
require('./md-module');
require('./yaml-module');
require('./table-module');
require('./sbml-module');

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
  constructor(logger, fileHandler){
    // stores modules in format
    // { filepath : module, ...}
    this.moduleCollection = {};
    this.graph = new TopoSort();
    this.logger = logger;
    this.fileHandler = fileHandler;
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
  addModuleDeep(rawAbsFilePath, type, options = {}){
    let absFilePath = path.normalize(rawAbsFilePath);
    let mdl = this._addModuleDeep(absFilePath, type, options);
    this._top = mdl;
    
    return mdl;
  }
 
  /**
   * It scan module dependence recursively.
   * 
   * @param {string} absFilePath Absolute module path.
   * @param {string} type A module type.
   * @param {object} options additional options.
   * 
   * @returns {_Module} Created module.
   */
  _addModuleDeep(absFilePath, type, options = {}){
    let moduleName = [absFilePath, '#', options.sheet || '0'].join('');
    if (!(moduleName in this.moduleCollection)) { // new file
      let mdl = this.addModule(absFilePath, type, options);
      mdl.getImportElements().forEach((importItem) => {
        this._addModuleDeep(importItem.source, importItem.type, importItem);
      });
      
      return mdl;
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
  addModule(filename, type='heta', options = {}){
    // parse
    let mdl = _Module.createModule(filename, type, options, this.logger, this.fileHandler);
    mdl.updateByAbsPaths();
    // push to moduleCollection
    let moduleName = [filename, '#', options.sheet || '0'].join('');
    this.moduleCollection[moduleName] = mdl;
    // set in graph
    let paths = mdl
      .getImportElements()
      .map((x) => [x.source, '#', x.sheet || 0].join(''));
    this.graph.add(moduleName, paths);

    return mdl;
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
      throw new Error(`Circular include in modules: [ ${error.circular.join(', ')} ]`);
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
        x._integrated = x.parsed.reduce((acc, current) => {
          if(current.action==='include'){
            let moduleName = [current.source, '#', current.sheet || '0'].join('');
            let childIntegrated = this.moduleCollection[moduleName]._integrated;
            let composition = compose(current, childIntegrated);
            acc = acc.concat(composition);
          }else{
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
function compose(obj, arr){
  let cleanedObj = _.omit(obj, ['action', 'id', 'class', 'source', 'type', 'sheet']);
  return arr.map((x) => {
    return _.chain(x)
      .cloneDeep()
      // transform each element here based on obj
      .assign(cleanedObj)
      .value();
  });
}

module.exports = ModuleSystem;
