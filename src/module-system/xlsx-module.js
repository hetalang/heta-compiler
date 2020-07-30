const _Module = require('./_module');
const { convertExcelSync } = require('../xlsx-connector');
const _ = require('lodash');

_Module.prototype.setXLSXModule = function(){
  // default results
  let rawData = [];
  // TODO: checking arguments is required
  const options = _.defaults(this.options, {
    sheet: 1,
    omitRows: 0
  });

  try {
    rawData = convertExcelSync(
      this.filename, 
      null, 
      { sheet: options.sheet, omitEmptyFields: true }
    );
    rawData.splice(0, options.omitRows); // remove rows
  } catch (e) {
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }

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
      
      let booleanConverter = (value, key) => {
        if (_.trim(value) === 'true') { // string to boolean
          return true;
        } else if (_.trim(value) === 'false') {
          return false;
        } else if (['isAmount', 'free', 'boundary'].indexOf(key) !== -1){ // converts 0/'0' -> false, 1/'1' -> true
          if (value == 0) {
            return false;
          } else if (value == 1) {
            return true;
          } else {
            return value;
          }
        } else { // for others
          return value;
        }
      };

      return _.mapValues(cleaned, booleanConverter);
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
