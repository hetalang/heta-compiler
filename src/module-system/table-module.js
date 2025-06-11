const { convertExcelSync } = require('../xlsx-connector');

/**
 * To initialize a Heta module of the "table" type.
 * It includes reading and parsing of file formatted as Heta-tables,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=table-module)
 * 
 * @returns {Module} Self.
 */
function tableLoader(fileContent, { sheet = 0, omitRows = 0, transpose = false } = {}) {
  // TODO: checking arguments is required

  let rawData = convertExcelSync(fileContent, null, { sheet, transpose });
  rawData.splice(0, omitRows); // remove rows

  let parsed = rawData
    .filter((x) => x.on) // ignore rows
    .map((x) => {      
      let cleaned = _cloneDeepWith(x, (value) => {
        if (typeof value?.valueOf() === 'string') {
          let s = clean(value);
          if (s !== '') { // if empty string return undefined
            return s;
          }
        } else if (Array.isArray(value)) {
          return value.map((y) => clean(y))
            .filter((y) => y !== ''); // removes empty strings from array
        } else {
          return value;
        }
      });

      let booleanProperties = [
        'isAmount', 'free', 'boundary', 'ss', 'output', 'reversible',
        'active', 'atStart'
      ];

      let normalized = {};
      Object.entries(cleaned).forEach(([key, value]) => {
        if (booleanProperties.indexOf(key) !== -1) { // in the list
          normalized[key] = forceBool(value);
        } else {
          normalized[key] = value;
        }
      });

      return normalized;
    });

  return parsed;
}

// remove blanks and new lines symbols
// return x if not a string
function clean(x) {
  if (typeof x !== 'string') {
    return x;
  }

  return x.trim()
    .replace(/_x000D_\n/g, '')
    .replace(/\r*\n+/g, '');
}

// converts 0/'0' -> false, 1/'1' -> true
function forceBool(x) {
  if (typeof x === 'string' && (x.trim() === 'true' || x.trim() === 'false')) {
    return x.trim() !== 'false';
  } else if (typeof x === 'number') {
    return x !== 0;
  } else {
    return x;
  }
}

// clone all own properties and arrays
function _cloneDeepWith(o, handler = (x) => x) {
  if (o instanceof Array) {
    let clone = o.map((key) => _cloneDeepWith(key, handler));

    return handler(clone);
  } else if (o instanceof Object) {
    let clone = {};
    
    Object.entries(o).forEach(([key, value]) => {
      let propertyValue = _cloneDeepWith(value, handler);
      if (propertyValue !== undefined) { // do not clone undefined properties
        clone[key] = propertyValue;
      }
    });
    
    return handler(clone);
  } else {
    return handler(o);
  }
}

module.exports = tableLoader;
