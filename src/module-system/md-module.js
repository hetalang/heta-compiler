const fs = require('fs');
const _ = require('lodash');
const _Module = require('./_module');

_Module.prototype.setMdModule = function(){
  try {
    let options = _.defaultsDeep(this.options, {
      pageId: 'undefined'
    });
    let fileContent = fs.readFileSync(this.filename, 'utf8');
    this.parsed = [{
      id: options.pageId,
      class: 'Page',
      content: fileContent
    }];
  } catch(e) {
    this.parsed = [];
    let msg = e.message + ` when converting module "${this.filename}"`;
    this.logger.error(msg, {type: 'ModuleError', filename: this.filename});
  }

  return this;
};
