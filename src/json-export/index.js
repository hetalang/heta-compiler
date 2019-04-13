const Container = require('../container');
const { _Export } = require('../core/_export');

class JSONExport extends _Export{
  get className(){
    return 'JSONExport';
  }
  get ext(){
    return 'json';
  }
  do(useVirtual){
    let qArr = [...this._storage]
      .filter((obj) => !obj[1].virtual || useVirtual)
      .map((obj) => obj[1].toQ());
    return JSON.stringify(qArr, null, 2);
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.classes.JSONExport = JSONExport;

module.exports = { JSONExport };
