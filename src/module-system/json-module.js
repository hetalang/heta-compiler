const HetaLevelError = require('../heta-level-error');

/**
 * To initialize a Heta module of the "json" type.
 * It includes reading and parsing file formatted as Heta-JSON,
 * see [Heta specifications](https://hetalang.github.io/specifications/modules#json-module)
 * 
 * @returns {Module} Self.
 */
function jsonLoader(fileContent) {
  let fileText = fileContent.toString('utf-8');
  let parsed = _JSONParse(fileText);

  return parsed;
}

/**
 * Auxillary function to parse JSON file in {@link _Module#setJSONModule} method.
 * This function is a wrapper of `JSON.parse()` method to get more clear description of errors.
 * 
 * @param {string} filename File to parse. It is used only for log messages.
 * @param  {...any} params Additional parameters passed to `JSON.parse()` method.
 * 
 * @returns {array} An object representing JSON file content.
 */
function _JSONParse(
  ...params
){
  try {
    return JSON.parse(...params);
  } catch(e) {
    if (!(e instanceof SyntaxError)) throw e;
    let message = e.message;
    let select = message.match(/at position (\d+)/);
    let coordinate;
    if (select) {
      let pos = +select[1];
      let parsedPart = params[0].substring(0, pos);
      let splittedText = parsedPart.split(/\r*\n/);
      let substringToShow = splittedText[splittedText.length-1];
      coordinate = {
        line: splittedText.length,
        column: substringToShow.length,
        position: pos
      };
      message = `(${coordinate.line}:${coordinate.column} in JSON) ` + message;
    }
    const error = new HetaLevelError(message);
    if (coordinate) error.coordinate = coordinate;
    throw error;
  }
}

module.exports = jsonLoader;