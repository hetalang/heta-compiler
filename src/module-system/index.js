const path = require('path');
const _ = require('lodash');
const TopoSort = require('@insysbio/topo-sort');
const _Module = require('./module');
require('./heta-module');
require('./json-module');
require('./md-module');
require('./yaml-module');
require('./xlsx-module');
require('./sbml-module');

class ModuleSystem {
  constructor(logger){
    // stores modules in format
    // { filepath : module, ...}
    this.moduleCollection = {};
    this.graph = new TopoSort();
    this.logger = logger;
  }
  // entrance to scan
  addModuleDeep(rawAbsFilePath, type, options = {}){
    let absFilePath = path.normalize(rawAbsFilePath);
    let mdl = this._addModuleDeep(absFilePath, type, options);
    this._top = mdl;
    
    return mdl;
  }
  // scan module dependence recursively
  _addModuleDeep(absFilePath, type, options = {}){
    let moduleName = [absFilePath, '#', options.sheet || '0'].join('');
    if(!(moduleName in this.moduleCollection)){ // new file
      let mdl = this.addModule(absFilePath, type, options);
      mdl.getImportElements().forEach((importItem) => {
        this._addModuleDeep(importItem.source, importItem.type, importItem);
      });
      
      return mdl;
    }else{ // if file already in moduleCollection do nothing
      return;
    }
  }
  // parse single file without dependencies
  addModule(filename, type='heta', options = {}){
    // parse
    let mdl = _Module.createModule(filename, type, options, this.logger);
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
  // other
  sortedPaths(){
    try{
      return this.graph.sort();
    }catch(error){
      throw new Error(`Circular include in modules: [ ${error.circular.join(', ')} ]`);
    }
  }
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

// temporal version of composer
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
