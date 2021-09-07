const fs = require('fs');
const _Module = require('./module');
const { SBMLParse } = require('./sbml-parse');

_Module.prototype.setSBMLModule = function(){
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  try {
    this.parsed = SBMLParse(this.filename, fileContent);
  } catch (e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }

  return this;
};
