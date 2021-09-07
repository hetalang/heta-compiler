const fs = require('fs');
const hetaParser = require('heta-parser');
const _Module = require('./module');

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

// wrapper for SyntaxError to show the coordinates
function _hetaParse(filename, ...params){
  try{
    return hetaParser.parse(...params);
  }catch(e){
    if((e instanceof hetaParser.SyntaxError)){
      e.name = 'HetaParsingError';
      let loc = e.location;
      let coord = `${loc.start.line}:${loc.start.column}-${loc.end.line}:${loc.end.column}`;
      e.message = `(${coord} in "${filename}") ` + e.message;
    }
    throw e;
  }
}
