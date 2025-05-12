const { SBMLParse } = require('./sbml-parse');

/**
 * To initialize a Heta module of the "sbml" type.
 * It includes reading and parsing SBML file and representing it into Q-object,
 * see [Heta specifications](https://hetalang.github.io/#/specifications/modules?id=sbml-module)
 * 
 * @returns {_Module} Self.
 */
function sbmlLoader(fileContent, _options){
  // set defaults
  const options = Object.assign({
    useCSwitcher: false, // TODO: implement
  }, _options);

  let fileText = fileContent.toString('utf-8');

  let parsed = SBMLParse(fileText, options);

  return parsed;
}

module.exports = sbmlLoader;
