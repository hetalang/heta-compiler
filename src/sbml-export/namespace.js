const { Namespace } = require('../namespace');
require('./expression');
const legalUnits = require('../legal-sbml-units');

Namespace.prototype.getSBMLImage = function() {
  let { logger, functionDefStorage } = this.container;

  // set unitDefinitions for concrete namespace
  if (this.isAbstract) {
    var listOfUnitDefinitions = []; 
  } else {
    try {
      listOfUnitDefinitions = this.getUniqueUnits()
        /*
        .filter((units) => {
          return units.length !== 1 
              || legalUnits.indexOf(units[0].kind) < 0
              || units[0].exponent !== 1
              || units[0].multiplier !== 1;
        })
        */
        .map((units) => {
          return units
            .toXmlUnitDefinition(legalUnits, { nameStyle: 'string', simplify: true });
        });
    } catch(err){
      logger.warn(err.message);
      listOfUnitDefinitions = [];
    }
  }

  if (this.isAbstract) {
    let msg = `UnitDefinitions in SBML will be skipped for the abstract namespace "${this.spaceName}".`;
    logger.info(msg);
  }

  // set functionDefinition
  let listOfFunctionDefinitions = [...functionDefStorage.values()]
    .filter((functionDef) => !functionDef.isCore);

  return {
    population: this,
    listOfUnitDefinitions,
    listOfFunctionDefinitions
  };
};