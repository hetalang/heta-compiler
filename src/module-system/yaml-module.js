const { readFileSync } = require('fs');
const path = require('path');
const _Module = require('./_module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

class YAMLModule extends _Module{
  constructor(filename){
    super(filename);
    this.type = 'yml';

    let fileContent = readFileSync(this.filename, 'utf8');
    this.parsed = jsYAML.safeLoad(fileContent);

    this.updateByAbsPaths();
  }
}

module.exports = YAMLModule;
