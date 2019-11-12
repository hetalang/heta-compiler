const fs = require('fs');
const _Module = require('./_module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

_Module.prototype.setYAMLModuleAsync = async function(){
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = jsYAML.safeLoad(fileContent);
  
  return this;
};
