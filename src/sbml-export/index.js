const Container = require('../container');
const { _Export } = require('../core/_export');
require('./model');

class SBMLExport extends _Export{
  merge(q, skipChecking){
    super.merge(q, skipChecking);
    if(q && typeof q.model!=='string')
      throw new TypeError(`"model" property in SBMLExport ${this.id} should be string.`);
    if(q && q.model){
      this.model = q.model;
    }
    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  get ext(){
    return 'xml';
  }
  do(){
    let modelObject = this._storage.get(this.model); // TODO: implement get to use this.get({id: model})
    if(modelObject===undefined){
      throw new Error(`Required model "${this.model}" is not found in container and will not be exported to SBML.`);
    }
    let code = modelObject
      .populate()
      .toSBML();
    return code;
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    return res;
  }
}

Container.prototype.classes.SBMLExport = SBMLExport;

module.exports = { SBMLExport };
