const fs = require('fs');
const _Module = require('./_module');
/*
_Module.prototype.setJSONModule = function(){
  this.type = 'json';

  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = _JSONParse(this.filename, fileContent);

  return this;
};
*/

_Module.prototype.setJSONModuleAsync0 = function(callback){
  fs.readFile(this.filename, 'utf8', (err, fileContent) => {
    if(err){
      callback(err);
    }else{
      try{
        this.parsed = _JSONParse(this.filename, fileContent);
        callback(null, this);
      }catch(e){
        callback(e);
      }
    }
  });
};

_Module.prototype.setJSONModuleAsync = async function(){
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = _JSONParse(this.filename, fileContent);
  
  return this;
};

function _JSONParse(filename, ...params){
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
