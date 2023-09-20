const _Module = require('./module');
const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

/**
 * To initialize a Heta module of the "yaml" type.
 * It includes reading and parsing file formatted as Heta-YAML,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=yaml-module)
 * 
 * @returns {Module} Self.
 */
_Module.prototype.setYAMLModule = function(fileHandler){
  try {
    let fileContent = fileHandler(this.filename);
    this.parsed = jsYAML.safeLoad(fileContent);
  } catch(e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }
  
  return this;
};
