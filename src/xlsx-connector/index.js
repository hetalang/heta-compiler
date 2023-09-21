const XLSX = require('xlsx'); 
const _ = require('lodash');

/*
  This script mimics the behavior of function convertExcel() from "excel-as-json", see https://www.npmjs.com/package/excel-as-json
  The main differences are: 
    - internally uses XLSX package, see https://sheetjs.gitbooks.io/docs/#json
    - sync working instead of async methods
*/

function convertExcelSync(src, dst = null, _options = {}){
  let options = Object.assign({
    sheet: 0, // first sheet
    omitRows: 0,
    omitEmptyFields: true // not used
  }, _options);

  // reading file
  let workbook = XLSX.read(src, {type: 'buffer'});
  if (options.sheet >= workbook.SheetNames.length)
    throw new Error(`There is no sheet #${options.sheet} in ${src}`);

  // get raw Objects
  let sheetName = workbook.SheetNames[options.sheet];
  let worksheet = workbook.Sheets[sheetName];
  let raw = XLSX.utils.sheet_to_json(worksheet, { blankrows: true });

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
        let valuesPart = value.toString().split(';').filter((x) => _.trim(x) !== '');
        _.set(output, keyPart, valuesPart);
      } else {
        _.set(output, key, value);
      }
    });

  return output;
}

module.exports = {
  convertExcelSync
};
