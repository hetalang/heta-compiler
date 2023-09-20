const _Module = require('./module');
const { convertExcelSync } = require('../xlsx-connector');
const _ = require('lodash');

/**
 * To initialize a Heta module of the "table" type.
 * It includes reading and parsing of file formatted as Heta-tables,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=table-module)
 * 
 * @returns {Module} Self.
 */
_Module.prototype.setTableModule = function(fileHandler){
  // default results
  let rawData = [];
  // TODO: checking arguments is required
  const options = _.defaults(this.options, {
    sheet: 0,
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
        if (value != null && typeof value.valueOf() === 'string') {
          return clean(value);
        }
        if (Array.isArray(value)) {
          return value
            .map((y) => clean(y))
            .filter((y) => y !== ''); // removes empty strings from array
        }
      });

      let booleanProperties = [
        'isAmount', 'free', 'boundary', 'output', 'reversible',
        'active', 'atStart'
      ];
      // converts 0/'0' -> false, 1/'1' -> true
      let forceBool = (x) => {
        if (typeof x === 'string' && (x.trim() === 'true' || x.trim() === 'false')) {
          return x.trim() !== 'false';
        } else if (typeof x === 'number') {
          return x !== 0;
        } else {
          return x;
        }
      };

      return _.mapValues(cleaned, (value, key) => {
        if (booleanProperties.indexOf(key) !== -1) {
          return forceBool(value);
        } else {
          return value;
        }
      });
    });

  this.parsed = dataFiltered;

  return this;
};

// remove blanks and new lines symbols
function clean(string){
  return string.trim()
    .replace(/_x000D_\n/g, '')
    .replace(/\r*\n+/g, '');
}
