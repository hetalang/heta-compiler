const XLSX = require('xlsx');
const { _parsePath, _setByPathArray, PathSyntaxError } = require('../utils');

class WorksheetNotFoundError extends Error {
  constructor(sheet) {
    super(`Table worksheet at index ${sheet} was not found.`);
    this.name = 'WorksheetNotFoundError';
    this.sheet = sheet;
  }
}

class TableHeaderError extends Error {
  constructor(header, part) {
    super(`Invalid header (first row) "${header}" in table`);
    this.name = 'TableHeaderError';
    this.header = header;
    this.part = part;
  }
}

/*
  This script mimics the behavior of function convertExcel() from "excel-as-json", see https://www.npmjs.com/package/excel-as-json
  The main differences are: 
    - internally uses XLSX package, see https://sheetjs.gitbooks.io/docs/#json
    - sync working instead of async methods
*/

function convertExcelSync(src, dst = null, { sheet = 0, transpose = false } = {}){
  // reading file
  let workbook = XLSX.read(src, {type: 'buffer'});
  if (sheet >= workbook.SheetNames.length)
    throw new WorksheetNotFoundError(sheet);

  // get raw Objects
  let sheetName = workbook.SheetNames[sheet];
  let worksheet = workbook.Sheets[sheetName];
  if (!transpose) {
    var raw = XLSX.utils.sheet_to_json(worksheet, { blankrows: true });
  } else {
    let transposed = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: true });
    // transpose the data back
    let maxLen = transposed.reduce((max, row) => Math.max(max, row.length), 0);
    raw = Array.from({ length: maxLen - 1 }, () => ({}));
    transposed.forEach((line) => {
      let key = line[0];
      if (!key) return; // skip empty lines

      line.slice(1).forEach((value, index) => {
        if (value !== undefined && value !== null) {
          raw[index][key] = value;
        }
      });
    });
  }

  // convert to final object
  let res = raw.map((x) => _toDeepPaths(x));

  return res;
}

function _toDeepPaths(o){
  let output = {};
  Object.entries(o).forEach(([key, value]) => {
    let searchArray = /^(.+)\[\]$/;
    if (searchArray.test(key)) { // checking if path looks like this "one.two.three[]"
      var keyClean = key.match(searchArray)[1];
      var valueClean = value.toString().split(';').filter((x) => x.trim() !== '');
    } else {
      keyClean = key;
      valueClean = value;
    }
    try {
      var pathArray = _parsePath(keyClean);
    } catch (error) {
      if (!(error instanceof PathSyntaxError)) throw error;
      throw new TableHeaderError(keyClean, error.part);
    }
    _setByPathArray.call(output, pathArray, valueClean);
  });

  return output;
}

module.exports = {
  convertExcelSync,
  WorksheetNotFoundError,
  TableHeaderError
};
