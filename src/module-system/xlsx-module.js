const _Module = require('./_module');
const { processFile } = require('excel-as-json'); // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');
const util = require('util');
const convertExcel = util.promisify(processFile);

_Module.prototype.setXLSXModuleAsync = async function(){
  // TODO: checking arguments is required
  const options = _.defaultsDeep(this.options, {
    sheet: 1,
    omitRows: 0,
    waitSec: 10
  });

  let rawData = await convertExcel(this.filename, null, {sheet: options.sheet, omitEmptyFields: true});
  rawData.splice(0, options.omitRows); // remove rows

  let dataFiltered = rawData
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

  this.parsed = dataFiltered;
  return this;
};

// remove blanks and new lines symbols
function clean(string){
  return _.trim(string)
    .replace(/_x000D_\n/g, '')
    .replace(/\r*\n+/g, '');
}
