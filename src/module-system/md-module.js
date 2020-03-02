const fs = require('fs');
const _ = require('lodash');
const _Module = require('./_module');

_Module.prototype.setMdModule = function(){
  let options = _.defaultsDeep(this.options, {
    pageId: 'undefined'
  });
  let fileContent = fs.readFileSync(this.filename, 'utf8');
  this.parsed = [{
    id: options.pageId,
    class: 'Page',
    content: fileContent
  }];

  return this;
};
