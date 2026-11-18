const { convertExcelSync, WorksheetNotFoundError, TableHeaderError } = require('../xlsx-connector');
const HetaLevelError = require('../heta-level-error');

/**
 * To initialize a Heta module of the "table" type.
 * It includes reading and parsing of file formatted as Heta-tables,
 * see [Heta specifications](https://hetalang.github.io/specifications/modules#table-module)
 * 
 * @returns {Module} Self.
 * @throws {HetaLevelError} If `sheet` or `omitRows` is invalid.
 */
function tableLoader(fileContent, { sheet = 0, omitRows = 0, transpose = false } = {}) {
  // check sheet is non negative integer
  if (typeof sheet !== 'number' || !Number.isInteger(sheet) || sheet < 0) {
    throw new HetaLevelError(
      `Table module option 'sheet' must be a non-negative integer, got: ${sheet}`,
      {diagnosticCode: 'TABLE_INVALID_SHEET_OPTION', path: 'sheet', value: sheet}
    );
  }
  // check omitRows is non negative integer
  if (typeof omitRows !== 'number' || !Number.isInteger(omitRows) || omitRows < 0) {
    throw new HetaLevelError(
      `Table module option 'omitRows' must be a non-negative integer, got: ${omitRows}`,
      {diagnosticCode: 'TABLE_INVALID_OMIT_ROWS_OPTION', path: 'omitRows', value: omitRows}
    );
  }
  if (typeof transpose !== 'boolean') {
    throw new HetaLevelError(
      `Table module option 'transpose' must be a boolean, got: ${JSON.stringify(transpose)}`,
      {diagnosticCode: 'TABLE_INVALID_TRANSPOSE_OPTION', path: 'transpose', value: transpose}
    );
  }

  try {
    var rawData = convertExcelSync(fileContent, null, { sheet, transpose });
  } catch (error) {
    if (error instanceof WorksheetNotFoundError) {
      throw new HetaLevelError(
        error.message,
        {diagnosticCode: 'TABLE_MISSING_SHEET', sheet: error.sheet}
      );
    }
    if (error instanceof TableHeaderError) {
      throw new HetaLevelError(
        error.message,
        {diagnosticCode: 'TABLE_INVALID_HEADER', header: error.header, part: error.part, sheet}
      );
    }
    throw error;
  }
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
