const hetaParser = require('heta-parser');

/**
 * To initialize a Heta module of the "heta" type.
 * It includes reading and parsing file formatted as Heta code,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=heta-module)
 * 
 * @returns {Module} Self.
 */
function hetaLoader(fileContent) {
  let fileText = fileContent.toString('utf-8');
  var parsed = _hetaParse(fileText);
  
  return parsed;
}

/**
 * This method is a wrapper for `parse()` method of "heta-parser" package to show errors location.
 * 
 * @param {string} filename File to parse. It is used only for log messages.
 * @param  {...any} params Additional parameters passed to `parse()` method.
 * @returns {array} Module content in Q-array format.
 */
function _hetaParse(...params){
  try {
    return hetaParser.parse(...params);
  } catch(e) {
    if((e instanceof hetaParser.SyntaxError)){
      e.name = 'HetaParsingError';
      let loc = e.location;
      let coord = `${loc.start.line}:${loc.start.column}-${loc.end.line}:${loc.end.column}`;
      e.message = `(${coord} in Heta file) ` + e.message;
    }
    throw e;
  }
}

module.exports = hetaLoader;