const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');

class XLSXExport extends _Export {
  get className(){
    return 'XLSXExport';
  }
  make(){
    let qArr = this._container
      .getPopulation(this.space)
      .map((x) => x.toFlat());
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '.json',
      type: 'text'
    }];
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.classes.XLSXExport = XLSXExport;

module.exports = { XLSXExport };
