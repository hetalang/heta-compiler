const { SBMLParseDetailed } = require('./sbml-parse');

/**
 * To initialize a Heta module of the "sbml" type.
 * It includes reading and parsing SBML file and representing it into Q-object,
 * see [Heta specifications](https://hetalang.github.io/specifications/modules#sbml-module)
 * 
 * @param {Buffer|string} fileContent SBML file content.
 * @param {object} _options SBML import options.
 * @param {Logger} [logger] Logger for SBML import diagnostics.
 *
 * @returns {_Module} Self.
 */
function sbmlLoader(fileContent, _options, logger){
  // set defaults
  const options = Object.assign({
    useCSwitcher: false, // TODO: implement
  }, _options);

  let fileText = fileContent.toString('utf-8');

  let { qArr, renamed, created } = SBMLParseDetailed(fileText, options);
  let renamedCount = Object.keys(renamed).length;
  let createdCount = created.length;

  logger?.info(
    `SBML identifiers converted: ${renamedCount} renamed, ${createdCount} created.`,
    {
      type: 'SBMLImportIdentifiers',
      renamed,
      created
    }
  );

  return qArr;
}

module.exports = sbmlLoader;
