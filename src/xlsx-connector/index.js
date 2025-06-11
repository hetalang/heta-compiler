const XLSX = require('xlsx');
const _set = require('lodash/set');
const HetaLevelError = require('../heta-level-error');

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
    throw new HetaLevelError(`There is no sheet #${sheet} in ${src}`);

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
  Object.entries(o)
    .forEach(([key, value]) => {
      let searchArray = /^(.+)\[\]$/;
      if (searchArray.test(key)) { // checking if path looks like this "one.two.three[]"
        let keyPart = key.match(searchArray)[1];
        let valuesPart = value.toString().split(';').filter((x) => x.trim() !== '');
        _set(output, keyPart, valuesPart);
      } else {
        _set(output, key, value);
      }
    });

  return output;
}

module.exports = {
  convertExcelSync
};
