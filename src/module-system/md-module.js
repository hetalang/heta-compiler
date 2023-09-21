const _ = require('lodash');

function mdLoader(filename, fileHandler){
  try {
    let options = _.defaultsDeep(options, {
      pageId: 'undefined'
    });
    let fileContent = fileHandler(filename);
    var parsed = [{
      id: options.pageId,
      class: 'Page',
      content: fileContent
    }];
  } catch(e) {
    parsed = [];
    let msg = e.message + ` when converting module "${filename}"`;
    //this.logger.error(msg, {type: 'ModuleError', filename: filename});
  }

  return parsed;
}

module.exports = mdLoader;