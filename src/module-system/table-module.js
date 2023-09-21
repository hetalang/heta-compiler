const { convertExcelSync } = require('../xlsx-connector');
const _cloneDeepWith = require('lodash/cloneDeepWith');
const _mapValues = require('lodash/mapValues');

/**
 * To initialize a Heta module of the "table" type.
 * It includes reading and parsing of file formatted as Heta-tables,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=table-module)
 * 
 * @returns {Module} Self.
 */
function tableLoader(fileContent, _options){
  // default results
  let rawData = [];
  // TODO: checking arguments is required
  const options = Object.assign({
    sheet: 0,
    omitRows: 0
  }, _options);

  rawData = convertExcelSync(
    fileContent,
    null, 
    { sheet: options.sheet, omitEmptyFields: true }
  );
  rawData.splice(0, options.omitRows); // remove rows

  let parsed = rawData
    .filter((x) => x.on) // ignore rows
    .map((x) => {
      let cleaned = _cloneDeepWith(x, (value) => {
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

      return _mapValues(cleaned, (value, key) => {
        if (booleanProperties.indexOf(key) !== -1) {
          return forceBool(value);
        } else {
          return value;
        }
      });
    });

  return parsed;
}

// remove blanks and new lines symbols
function clean(string){
  return string.trim()
    .replace(/_x000D_\n/g, '')
    .replace(/\r*\n+/g, '');
}

module.exports = tableLoader;