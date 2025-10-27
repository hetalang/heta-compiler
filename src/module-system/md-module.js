function mdLoader(fileContent, _options){
  // defaults
  let options = Object.assign({
    pageId: 'undefined'
  }, _options);

  let fileText = fileContent.toString('utf-8');
  let parsed = [{
    id: options.id,
    class: 'Page',
    content: fileText
  }];

  return parsed;
}

module.exports = mdLoader;
