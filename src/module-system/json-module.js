const fs = require('fs');
const _Module = require('./module');

/**
 * To initialize a Heta module of the "json" type.
 * It includes reading and parsing file formatted as Heta-JSON,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=json-module)
 * 
 * @returns {Module} Self.
 */
_Module.prototype.setJSONModule = function(){
  //checking file exists
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  try {
    this.parsed = _JSONParse(this.filename, fileContent);
  } catch(e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }

  return this;
};

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
  filename, // used here to display in error message 
  ...params
){
  try {
    return JSON.parse(...params);
  } catch(e) {
    let select = e.message.match(/at position (\d*)/); // This is ugly part, sorry
    if((e instanceof SyntaxError) && typeof +select[1]==='number'){
      e.name = 'JSONSyntaxError';
      let pos = +select[1];
      let parsedPart = params[0].substring(0, pos);
      let splittedText = parsedPart.split(/\r*\n/);
      let substringToShow = splittedText[splittedText.length-1];
      e.coordinate = {
        line: splittedText.length,
        column: substringToShow.length,
        position: pos,
        filename: filename
      };
      e.message = `(${e.coordinate.line}:${e.coordinate.column} in "${e.coordinate.filename}") ` + e.message;
    }
    throw e;
  }
}
