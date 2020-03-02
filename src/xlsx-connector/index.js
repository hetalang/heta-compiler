const XLSX = require('xlsx'); 
const _ = require('lodash');

/*
  This script mimics the behaivior of function convertExcel() from "excel-as-json", see https://www.npmjs.com/package/excel-as-json
  The main differences are: 
    - the usage of XLSX, see https://sheetjs.gitbooks.io/docs/#json
    - sync working instead of async methods
*/

function convertExcelSync(src, dst = null, options = {}){
  _.defaults(options, {
    sheet: 1, // first sheet
    omitRows: 0,
    omitEmptyFields: true // not used
  });

  // reading file
  let workbook = XLSX.readFile(src);
  if (workbook.SheetNames.length < options.sheet)
    throw new Error(`There is no sheet ${options.sheet} in ${src}`);

  // get raw Objects
  let sheetName = workbook.SheetNames[options.sheet-1];
  let worksheet = workbook.Sheets[sheetName];
  let raw = XLSX.utils.sheet_to_json(worksheet, { blankrows: true });

  // convert to final object
  let res = raw.map((x) => _toDeepPaths(x));

  return res;
}

function _toDeepPaths(o){
  let output = {};
  _.each((o), (value, key) => {
    let searchArray = /^(.+)\[\]$/;
    if (searchArray.test(key)) { // checking if path looks like this "one.two.three[]"
      let keyPart = key.match(searchArray)[1];
      let valuesPart = value.split(';').filter((x) => _.trim(x) !== '');
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
