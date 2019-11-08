const _Module = require('./_module');
const convertExcel = require('excel-as-json').processFile; // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');

_Module.prototype.setXLSXModuleAsync = async function(){
  // TODO: checking arguments is required
  const options = _.defaultsDeep(this.options, {
    sheetNum: [1],
    omitRows: 0,
    waitSec: 10
  });

  let tmp = options.sheetNum.map(async (i) => {
    let data = await convertExcel(this.filename, null, {sheet: i, omitEmptyFields: true});
    data.splice(0, options.omitRows); // remove rows
    let dataFiltered = data
      .filter((x) => x.on) // ignore rows
      .map((x) => {
        let cleaned = _.cloneDeepWith(x, (value) => {
          if(_.isString(value)) {
            return clean(value);
          }
          if(_.isArray(value)) {
            return value
              .map((y) => clean(y))
              .filter((y) => y!==''); // removes empty strings from array
          }
        });
        return cleaned;
      });
    return dataFiltered;
  });

  let dataFilteredArray = await Promise.all(tmp);
  this.parsed = _.flatten(dataFilteredArray);

  return this;
};

// remove blanks and new lines symbols
function clean(string){
  return _.trim(string)
    .replace(/_x000D_\n/g, '')
    .replace(/\r*\n+/g, '');
}
