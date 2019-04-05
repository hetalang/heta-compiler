const { readFileSync } = require('fs');
const path = require('path');
const hetaParser = require('heta');
const _Module = require('./_module');

class HetaModule extends _Module{
  constructor(filename){
    super(filename);
    this.type = 'heta';

    let fileContent = readFileSync(this.filename, 'utf8');
    this.parsed = hetaParser.parse(fileContent);

    let absDirPath = path.dirname(this.filename);
    this.parsed // replace relative paths by absolute ones
      .filter((simple) => simple.action==='import')
      .forEach((simple) => simple.source = path.resolve(absDirPath, simple.source));
  }
}

module.exports = HetaModule;
