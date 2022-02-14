const XLSX = require('xlsx');
const path = require('path');
const TableExport = require('../table-export');
const _ = require('lodash');

const bookTypes = {
  xlsx: {fileExt: '.xlsx', containerSheets: 'ZIP', description: 'multiExcel 2007+ XML Format'},
  xlsm: {fileExt: '.xlsm', containerSheets: 'ZIP', description: 'multiExcel 2007+ Macro XML Format'},
  xlsb: {fileExt: '.xlsb', containerSheets: 'ZIP', description: 'multiExcel 2007+ Binary Format'},
  biff8: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 97-2004 Workbook Format'},
  biff5: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 5.0/95 Workbook Format'},
  biff4: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 4.0 Worksheet Format'},
  biff3: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 3.0 Worksheet Format'},
  biff2: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 2.0 Worksheet Format'},
  xlml: {fileExt: '.xls', containerSheets: 'none', description: 'multiExcel 2003-2004 (SpreadsheetML)'},
  ods: {fileExt: '.ods', containerSheets: 'ZIP', description: 'multiOpenDocument Spreadsheet'},
  fods: {fileExt: '.fods', containerSheets: 'none', description: 'multiFlat OpenDocument Spreadsheet'},
  wk3: {fileExt: '.wk3', containerSheets: 'none', description: 'singleLotus Workbook (WK3)'},
  csv: {fileExt: '.csv', containerSheets: 'none', description: 'singleComma Separated Values'},
  txt: {fileExt: '.txt', containerSheets: 'none', description: 'singleUTF-16 Unicode Text (TXT)'},
  sylk: {fileExt: '.sylk', containerSheets: 'none', description: 'singleSymbolic Link (SYLK)'},
  html: {fileExt: '.html', containerSheets: 'none', description: 'singleHTML Document'},
  dif: {fileExt: '.dif', containerSheets: 'none', description: 'singleData Interchange Format (DIF)'},
  dbf: {fileExt: '.dbf', containerSheets: 'none', description: 'singledBASE II + VFP Extensions (DBF)'},
  wk1: {fileExt: '.wk1', containerSheets: 'none', description: 'singleLotus Worksheet (WK1)'},
  rtf: {fileExt: '.rtf', containerSheets: 'none', description: 'singleRich Text Format (RTF)'},
  prn: {fileExt: '.prn', containerSheets: 'none', description: 'singleLotus Formatted Text'},
  eth: {fileExt: '.eth', containerSheets: 'none', description: 'singleEthercalc Record Format (ETH)'}
};

// see more details here: https://github.com/SheetJS/sheetjs#writing-options
TableExport.prototype.makeAndSave = function(pathPrefix){
  let { fileExt } = bookTypes[this.bookType];

  let out = this.make();
  let relPath = [this.filepath || this.id, fileExt].join('');
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
    XLSX.writeFile(wb, fullPath, {bookType: this.bookType});
  } catch (err) {
    let logger = this._container.logger;
    let msg =`Heta compiler cannot export to file: "${err.path}" because it is busy.`;
    logger.error(msg, {type: 'ExportError'});
  }
};
