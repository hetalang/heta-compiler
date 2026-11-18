const { Namespace } = require('../namespace');
const legalUnits = require('../legal-sbml-units');
const pkg = require('../../package.json');
const HetaLevelError = require('../heta-level-error');

Namespace.prototype.getSBMLImage = function() {
  let { logger, functionDefStorage } = this.container;

  // set unitDefinitions for concrete namespace
  if (this.isAbstract) {
    var listOfUnitDefinitions = []; 
  } else {
      listOfUnitDefinitions = this.getUniqueUnits()
        /*
        .filter((units) => {
          return units.length !== 1 
              || legalUnits.indexOf(units[0].kind) < 0
              || units[0].exponent !== 1
              || units[0].multiplier !== 1;
        })
        */
        .flatMap((units) => {
          try {
            return [units.toXmlUnitDefinition(legalUnits, { nameStyle: 'string', simplify: true })];
          } catch (error) {
            if (!(error instanceof HetaLevelError)) throw error;
            logger.warn(error.message, {...error.opt, space: this.spaceName, unitExpression: units.toString()});
            return [];
          }
        });
  }

  if (this.isAbstract) {
    let msg = `UnitDefinitions in SBML will be skipped for the abstract namespace "${this.spaceName}".`;
    logger.info(msg);
  }

  // set functionDefinition
  let listOfFunctionDefinitions = [...functionDefStorage.values()]
    .filter((functionDef) => !functionDef.isCore);

  // warn about TimeSwitcher and CSwitcher
  let timeSwitchersIds = this.selectByClassName('TimeSwitcher')
    .map((x) => x.id);
  if (timeSwitchersIds.length > 0) {
    logger.warn(
      `TimeSwitcher is not supported in SBML, got ${timeSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`, 
      {diagnosticCode: 'SBML_TIME_EVENT_CONVERTED_TO_DEVENT', space: this.spaceName, ids: timeSwitchersIds, format: 'sbml'}
    );
  }
  let cSwitchersIds = this.selectByClassName('CSwitcher')
    .map((x) => x.id);
  if (cSwitchersIds.length > 0) {
    logger.warn(
      `CSwitcher is not supported in SBML, got ${cSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`, 
      {diagnosticCode: 'SBML_CEVENT_CONVERTED_TO_DEVENT', space: this.spaceName, ids: cSwitchersIds, format: 'sbml'}
    );
  }

  let hasMeta = {
    toolName: pkg.name,
    toolVersion: pkg.version,
    createdAt: new Date().toISOString(),
    platformId: this.container._builder.id,
    platformVersion: this.container._builder.version,
    namespaceId: this.spaceName,
    format: 'sbml'
  };

  return {
    population: this,
    listOfUnitDefinitions,
    listOfFunctionDefinitions,
    hasMeta
  };
};
