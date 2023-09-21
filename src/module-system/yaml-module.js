const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

/**
 * To initialize a Heta module of the "yaml" type.
 * It includes reading and parsing file formatted as Heta-YAML,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=yaml-module)
 * 
 * @returns {Module} Self.
 */
function yamlLoader(filename, fileHandler){
  let fileContent = fileHandler(filename);
  let parsed = jsYAML.safeLoad(fileContent);
  
  return parsed;
}

module.exports = yamlLoader;
