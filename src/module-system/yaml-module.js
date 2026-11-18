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
  } catch (error) {
    if (error instanceof jsYAML.YAMLException) {
      throw new HetaLevelError(
        error.message,
        {diagnosticCode: 'MODULE_SYNTAX_ERROR', ...(error.mark ? {location: {line: error.mark.line + 1, column: error.mark.column + 1}} : {})}
      );
    }
    throw error;
  }
}

module.exports = yamlLoader;
