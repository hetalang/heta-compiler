const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');

class JSONExport extends _Export {
  get className(){
    return 'JSONExport';
  }
  get ext(){
    return 'json';
  }
  do(){
    let qArr = this._container
      .getPopulation(this.space)
      .map((x) => x.toQ());
    
    return JSON.stringify(qArr, null, 2);
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.classes.JSONExport = JSONExport;

module.exports = { JSONExport };
