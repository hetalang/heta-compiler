const { readFileSync } = require('fs');
const path = require('path');
const hetaParser = require('heta');
const _Module = require('./_module');

class HetaSyntaxError extends SyntaxError{
  constructor(se){ // error as argument
    let loc = se.location;
    let coord = `${loc.start.line}:${loc.start.column}-${loc.end.line}:${loc.end.column}`;
    let message = `(${coord}) ${se.message}`;
    super(message, se.filename, se.lineNumber);
    this.name = 'HetaSyntaxError';
  }
}

class HetaModule extends _Module{
  constructor(filename){
    super(filename);
    this.type = 'heta';

    let fileContent = readFileSync(this.filename, 'utf8');
    try{
      this.parsed = hetaParser.parse(fileContent);
    }catch(e){
      throw new HetaSyntaxError(e);
    }

    let absDirPath = path.dirname(this.filename);
    this.parsed // replace relative paths by absolute ones
      .filter((simple) => simple.action==='import')
      .forEach((simple) => simple.source = path.resolve(absDirPath, simple.source));
  }
}

module.exports = {
  HetaModule
};
