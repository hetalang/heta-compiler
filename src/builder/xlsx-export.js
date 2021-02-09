const XLSX = require('xlsx');
const path = require('path');
const XLSXExport = require('../xlsx-export');
const _ = require('lodash');

XLSXExport.prototype.makeAndSave = function(pathPrefix){
  let out = this.make();
  let relPath = [this.filepath || this.id, '.xlsx'].join('');
  let fullPath = path.join(pathPrefix, relPath);
  
  let wb = XLSX.utils.book_new();
  out.forEach((x) => {
    let omitRows = x.omitRows!==undefined
      ? x.omitRows // use omitRows from out 
      : this.omitRows;
    let ws = XLSX.utils.json_to_sheet(
      _.times(omitRows, {}).concat(x.content),
      { header: x.headerSeq, skipHeader: x.skipHeader } // XLSX tries to mutate header
    );
    XLSX.utils.book_append_sheet(wb, ws, x.name);
  });

  try {
    XLSX.writeFile(wb, fullPath, {});
  } catch (err) {
    let logger = this._container.logger;
    let msg =`Heta compiler cannot export to file: "${err.path}" because it is busy.`;
    logger.error(msg, {type: 'ExportError'});
  }
};
