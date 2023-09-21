function mdLoader(filename, fileHandler, _options){
  // defaults
  let options = Object.assign({
    pageId: 'undefined'
  }, _options);

  let fileContent = fileHandler(filename);
  let parsed = [{
    id: options.pageId,
    class: 'Page',
    content: fileContent
  }];

  return parsed;
}

module.exports = mdLoader;
