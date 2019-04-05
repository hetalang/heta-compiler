const path = require('path');
const _ = require('lodash');
const TopoSort = require('topo-sort');
let HetaModule = require('./heta-module');
let JSONModule = require('./json-module');
let YAMLModule = require('./yaml-module');

class ModuleSystem {
  constructor(){
    this.storage = {};
    this.graph = new TopoSort();
  }
  // parse single file without dependencies
  registerModule(filepath, type){
    // parse
    console.log(type);
    console.log(filepath);
    switch(type){
      case 'heta':
        var mdl = new HetaModule(filepath);
        break;
      case 'json':
        mdl = new JSONModule(filepath);
        break;
      case 'yml':
        mdl = new YAMLModule(filepath);
        break;
      default:
        throw new Error(`Unknown type "${type}" for file "${filepath}" `);
    }
    this.storage[filepath] = mdl;
    // set in graph
    let paths = mdl
      .getImportElements()
      .map((x) => x.source);
    this.graph.add(filepath, paths);

    return mdl;
  }
  // entrance to scan
  addModuleDeep(rawAbsFilePath, type){
    let absFilePath = path.normalize(rawAbsFilePath);
    this._top = this._addModuleDeep(absFilePath, type);
    return this._top;
  }
  // scan module dependences recursively
  _addModuleDeep(absFilePath, type){
    if(!(absFilePath in this.storage)){ // new file
      let mdl = this.registerModule(absFilePath, type);
      mdl.getImportElements()
        .forEach((p) => this._addModuleDeep(p.source, p.type));
      return mdl;
    }
    // if file already in storage do nothing
  }
  sortedPaths(){
    return this.graph.sort();
  }
  integrate(){
    this
      .sortedPaths()
      .reverse()
      .map((y) => this.storage[y])
      .forEach((x) => {
        x._integrated = x.parsed.reduce((acc, current) => {
          if(current.action==='import'){
            let childIntegrated = this.storage[current.source]._integrated;
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
  return arr.map((x) => {
    return _.chain(x)
      .cloneDeep()
      // transform each element here based on obj
      .value();
  });
}

module.exports = ModuleSystem;
