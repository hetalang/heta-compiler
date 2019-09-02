const fs = require('fs');
const hetaParser = require('heta-parser');
const _Module = require('./_module');
/*
_Module.prototype.setHetaModule = function(){
  this.type = 'heta';

  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = _hetaParse(this.filename, fileContent);

  return this;
};
*/ 
_Module.prototype.setHetaModuleAsync = function(callback){
  fs.readFile(this.filename, 'utf8', (err, fileContent) => {
    if(err){
      callback(err);
    }else{
      try{
        this.parsed = _hetaParse(this.filename, fileContent);
        callback(null, this);
      }catch(e){
        callback(e);
      }
    }
  });
};

function _hetaParse(filename, ...params){
  try{
    return hetaParser.parse(...params);
  }catch(e){
    if((e instanceof hetaParser.SyntaxError)){
      e.name = 'HetaSyntaxError';
      let loc = e.location;
      let coord = `${loc.start.line}:${loc.start.column}-${loc.end.line}:${loc.end.column}`;
      e.message = `(${coord} in "${filename}") ` + e.message;
    }
    throw e;
  }
}
