const fs = require('fs');
const _Module = require('./_module');

_Module.prototype.setJSONModule = function(){
  //checking file exists
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  try {
    this.parsed = _JSONParse(this.filename, fileContent);
  } catch(e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, 'ModuleError');
  }

  return this;
};

function _JSONParse(
  filename, // used here to display in error message 
  ...params
){
  try{
    return JSON.parse(...params);
  }catch(e){
    let select = e.message.match(/at position (\d*)/); // This is ugly part, sorry
    if((e instanceof SyntaxError) && typeof +select[1]==='number'){
      e.name = 'JSONSynaxError';
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
