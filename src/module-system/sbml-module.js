const _Module = require('./module');
const { SBMLParse } = require('./sbml-parse');

/**
 * To initialize a Heta module of the "sbml" type.
 * It includes reading and parsing SBML file and representing it into Q-object,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=sbml-module)
 * 
 * @returns {_Module} Self.
 */
_Module.prototype.setSBMLModule = function(fileHandler){
  let fileContent = fileHandler(this.filename);
  try {
    this.parsed = SBMLParse(this.filename, fileContent);
  } catch (e) {
    this.parsed = [];
    let msg = e.message + `, converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }

  return this;
};
