const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');

class XLSXExport extends _Export {
  get className(){
    return 'XLSXExport';
  }
  get ext(){
    return 'json';
  }
  do(){
    let qArr = this._container
      .getPopulation(this.space)
      .map((x) => x.toFlat());
    
    return JSON.stringify(qArr, null, 2);
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.classes.XLSXExport = XLSXExport;

module.exports = { XLSXExport };
