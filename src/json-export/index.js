const Container = require('../container');
const { _Export } = require('../core/_export');

class JSONExport extends _Export{
  get className(){
    return 'JSONExport';
  }
  get ext(){
    return 'json';
  }
  do(){
    let qArr = this._container.toQArr();
    
    return JSON.stringify(qArr, null, 2);
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.classes.JSONExport = JSONExport;

module.exports = { JSONExport };
