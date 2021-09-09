const fs = require('fs');
const hetaParser = require('heta-parser');
const _Module = require('./module');

/**
 * To initialize a Heta module of the "heta" type.
 * It includes reading and parsing file formatted as Heta code,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=heta-module)
 * 
 * @returns {Module} Self.
 */
_Module.prototype.setHetaModule = function(){
  try {
    let fileContent = fs.readFileSync(this.filename, 'utf8');
    this.parsed = _hetaParse(this.filename, fileContent);
  } catch(e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }
  
  return this;
};

/**
 * This method is a wrapper for `parse()` method of "heta-parser" package to show errors location.
 * 
 * @param {string} filename File to parse. It is used only for log messages.
 * @param  {...any} params Additional parameters passed to `parse()` method.
 * @returns {array} Queue array format.
 */
function _hetaParse(filename, ...params){
  try {
    return hetaParser.parse(...params);
  } catch(e) {
    if((e instanceof hetaParser.SyntaxError)){
      e.name = 'HetaParsingError';
      let loc = e.location;
      let coord = `${loc.start.line}:${loc.start.column}-${loc.end.line}:${loc.end.column}`;
      e.message = `(${coord} in "${filename}") ` + e.message;
    }
    throw e;
  }
}
