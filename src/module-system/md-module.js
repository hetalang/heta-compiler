const _ = require('lodash');
const _Module = require('./module');

_Module.prototype.setMdModule = function(fileHandler){
  try {
    let options = _.defaultsDeep(this.options, {
      pageId: 'undefined'
    });
    let fileContent = fileHandler(this.filename);
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
