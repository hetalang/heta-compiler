const { readFileSync } = require('fs');
const path = require('path');
const hetaParser = require('heta');
const _Module = require('./_module');

class HetaModule extends _Module{
  constructor(filename){
    super(filename);
    this.type = 'heta';

    let fileContent = readFileSync(this.filename, 'utf8');
    this.parsed = _hetaParse(this.filename, fileContent);

    this.updateByAbsPaths();
  }
}

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

module.exports = {
  HetaModule
};
