const fs = require('fs');
const _ = require('lodash');
const _Module = require('./_module');

_Module.prototype.setMdModuleAsync = function(callback){
  let options = _.defaultsDeep(this.options, {
    pageId: 'undefined'
  });
  fs.readFile(this.filename, 'utf8', (err, fileContent) => {
    if(err){
      callback(err);
    }else{
      this.parsed = [{
        id: options.pageId,
        class: 'Page',
        content: fileContent
      }];
      callback(null, this);
    }
  });
};
