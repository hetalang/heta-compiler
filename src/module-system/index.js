const path = require('path');
const async = require('async');
const _ = require('lodash');
const TopoSort = require('topo-sort');
const _Module = require('./_module');
require('./heta-module');
require('./json-module');
require('./yaml-module');
require('./xlsx-module');

class ModuleSystem {
  constructor(){
    this.storage = {};
    this.graph = new TopoSort();
  }
  // === sync version of all methods ===
  // entrance to scan
  addModuleDeep(rawAbsFilePath, type){
    let absFilePath = path.normalize(rawAbsFilePath);
    this._top = this._addModuleDeep(absFilePath, type);
    return this._top;
  }
  // scan module dependences recursively
  _addModuleDeep(absFilePath, type){
    if(!(absFilePath in this.storage)){ // new file
      let mdl = this.addModule(absFilePath, type);
      mdl.getImportElements()
        .forEach((p) => this._addModuleDeep(p.source, p.type));
      return mdl;
    }
    // if file already in storage do nothing
  }
  // parse single file without dependencies
  addModule(filepath, type){
    // parse
    let mdl = _Module.createModule(filepath, type);
    // push to storage
    this.storage[filepath] = mdl;
    // set in graph
    let paths = mdl
      .getImportElements()
      .map((x) => x.source);
    this.graph.add(filepath, paths);

    return mdl;
  }
  // === async version of all methods ===
  // entrance to scan
  addModuleDeepAsync(rawAbsFilePath, type, options = {}, callback){
    let absFilePath = path.normalize(rawAbsFilePath);
    this._addModuleDeepAsync(absFilePath, type, options, (err, mdl) => {
      if(err){
        callback(err);
      }else{
        this._top = mdl;
        callback(null);
      }
    });
  }
  // scan module dependences recursively
  _addModuleDeepAsync(absFilePath, type, options = {}, callback){
    if(!(absFilePath in this.storage)){ // new file
      this.addModuleAsync(absFilePath, type, options, (err, mdl) => {
        if(err){
          callback(err);
        }else{
          async.eachSeries(mdl.getImportElements(), (importItem, cb) => {
            this._addModuleDeepAsync(importItem.source, importItem.type, importItem.options, cb);
          }, (err) => {
            if(err){
              callback(err);
            }else{
              callback(null, mdl);
            }
          });
        }
      });
    }else{ // if file already in storage do nothing
      callback(null);
    }
  }
  // parse single file without dependencies
  addModuleAsync(filename, type, options = {}, callback){
    // parse
    _Module.createModuleAsync(filename, type, options, (err, mdl) => {
      if(err){
        callback(err);
      }else{
        mdl.updateByAbsPaths();
        // push to storage
        this.storage[filename] = mdl;
        // set in graph
        let paths = mdl
          .getImportElements()
          .map((x) => x.source);
        this.graph.add(filename, paths);
        callback(null, mdl);
      }
    });

  }
  // other
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
  let cleanedObj = _.omit(obj, ['action', 'id', 'class', 'source', 'type']);
  return arr.map((x) => {
    return _.chain(x)
      .cloneDeep()
      // transform each element here based on obj
      .assign(cleanedObj)
      .value();
  });
}

module.exports = ModuleSystem;
