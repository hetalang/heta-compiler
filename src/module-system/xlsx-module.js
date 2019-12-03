const _Module = require('./_module');
const { processFile } = require('excel-as-json'); // see https://www.npmjs.com/package/excel-as-json
const _ = require('lodash');

// to use as Promise
const util = require('util');
const convertExcel = util.promisify(processFile);

_Module.prototype.setXLSXModuleAsync = async function(){
  // TODO: checking arguments is required
  const options = _.defaultsDeep(this.options, {
    sheet: 1,
    omitRows: 0,
    waitSec: 10
  });

  // this part is the way to fix bug in excel-as-json 10 second before callback
  // throws error in 10 seconds in any way
  let waiter = new Promise((resolve, reject) => {
    setTimeout(() => {
      let err = new Error(`sheet #${options.sheet} is not found in "${this.filename}" or reading table require more than ${options.waitSec} sec.`);
      reject(err);
    }, 1000*options.waitSec);
  });

  // who is faster
  let rawData = await Promise.race([
    convertExcel(this.filename, null, { sheet: options.sheet, omitEmptyFields: true }),
    waiter
  ]);
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
