const path = require('path');
const _ = require('lodash');
const TopoSort = require('@insysbio/topo-sort');
const _Module = require('./_module');
require('./heta-module');
require('./json-module');
require('./md-module');
require('./yaml-module');
require('./xlsx-module');
const { ModuleError } = require('../heta-error');

class ModuleSystem {
  constructor(){
    // stores modules in format
    // { filepath : module, ...}
    this.moduleCollection = {};
    this.graph = new TopoSort();
  }
  // entrance to scan
  async addModuleDeepAsync(rawAbsFilePath, type, options = {}){
    let absFilePath = path.normalize(rawAbsFilePath);
    let mdl = await this._addModuleDeepAsync(absFilePath, type, options);
    this._top = mdl;

    return mdl;
  }
  // scan module dependences recursively
  async _addModuleDeepAsync(absFilePath, type, options = {}){
    let moduleName = [absFilePath, '#', options.sheet || '1'].join('');
    if(!(moduleName in this.moduleCollection)){ // new file
      let mdl = await this.addModuleAsync(absFilePath, type, options);
      let tmp = mdl.getImportElements().map(async (importItem) => {
        await this._addModuleDeepAsync(importItem.source, importItem.type, importItem);
      });
      await Promise.all(tmp);
      return mdl;
    }else{ // if file already in moduleCollection do nothing
      return;
    }
  }
  // parse single file without dependencies
  async addModuleAsync(filename, type='heta', options = {}){
    // parse
    let mdl = await _Module.createModuleAsync(filename, type, options);
    mdl.updateByAbsPaths();
    // push to moduleCollection
    let moduleName = [filename, '#', options.sheet || '1'].join('');
    this.moduleCollection[moduleName] = mdl;
    // set in graph
    let paths = mdl
      .getImportElements()
      .map((x) => [x.source, '#', x.sheet || 1].join(''));
    this.graph.add(moduleName, paths);
    
    return mdl;
  }
  // other
  sortedPaths(){
    try{
      return this.graph.sort();
    }catch(error){
      throw new ModuleError(`Circular include in modules: [ ${error.circular.join(', ')} ]`);
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
            let moduleName = [current.source, '#', current.sheet || '1'].join('');
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
