const { readFileSync } = require('fs');
const _Module = require('./_module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

_Module.prototype.setYAMLModule = function(){
  this.type = 'yml';

  let fileContent = readFileSync(this.filename, 'utf8');
  this.parsed = jsYAML.safeLoad(fileContent);

  return this;
};
