const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
const path = require('path');
const XLSX = require('xlsx');
const _ = require('lodash');

class XLSXExport extends _Export {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);
    if(q.omitRows!==undefined) this.omitRows = q.omitRows;

    return this;
  }
  get className(){
    return 'XLSXExport';
  }
  makeAndSave(pathPrefix){
    let out = this.make();
    let relPath = [this.filepath || this.id, '.xlsx'].join('');
    let fullPath = path.join(pathPrefix, relPath);

    let content = _.times(this.omitRows, {}).concat(out[0].content);

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(
      content,
      { header: [] }
    );
    XLSX.utils.book_append_sheet(wb, ws, 'one');
    XLSX.writeFile(wb, fullPath, {});
  }
  make(){
    let qArr = this._container
      .getPopulation(this.space)
      .map((x) => x.toFlat());
    
    return [{
      content: qArr,
      pathSuffix: '',
      type: 'object'
    }];
  }
  toQ(){
    let res = super.toQ();
    if(this.omitRows) res.omitRows = this.omitRows;
    return res;
  }
}

Container.prototype.classes.XLSXExport = XLSXExport;

module.exports = { XLSXExport };
