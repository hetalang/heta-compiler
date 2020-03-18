const fs = require('fs');
const _Module = require('./_module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

_Module.prototype.setYAMLModule = function(){
  try {
    let fileContent = fs.readFileSync(this.filename, 'utf8');
    this.parsed = jsYAML.safeLoad(fileContent);
  } catch(e) {
    this.logger.error(e.message, 'ModuleError');
  }
  
  return this;
};
