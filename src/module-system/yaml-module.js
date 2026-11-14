const jsYAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const HetaLevelError = require('../heta-level-error');

/**
 * To initialize a Heta module of the "yaml" type.
 * It includes reading and parsing file formatted as Heta-YAML,
 * see [Heta specifications](https://hetalang.github.io/specifications/modules#yaml-module)
 * 
 * @returns {Module} Self.
 */
function yamlLoader(fileContent){
  let fileText = fileContent.toString('utf-8');
  try {
    return jsYAML.load(fileText);
  } catch (e) {
    if (e instanceof jsYAML.YAMLException) {
      throw new HetaLevelError(e.message);
    }
    throw e;
  }
}

module.exports = yamlLoader;
