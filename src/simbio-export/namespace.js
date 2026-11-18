const { Namespace } = require('../namespace');
const legalUnits = require('./legal-units');

Namespace.prototype.getSimbioImage = function() {
  let { logger, functionDefStorage } = this.container;

  // checking unitTerm for Species
  this.selectByInstanceOf('Species')
    .filter((species) => species.isAmount)
    .forEach((species) => {
      if (typeof species.unitsParsed === 'undefined') {
        logger.error(
          `Species "${species.index}" requires units for SimBiology export when isAmount is true.`,
          {diagnosticCode: 'MISSING_UNIT', space: this.spaceName, id: species.id, path: 'units', format: 'simbio'}
        );
        return; // BRAKE
      }
      let term = species.unitsParsed.toTerm();
      if (term === undefined) {
        logger.error(
          `Unit term cannot be calculated for species "${species.index}" during SimBiology export.`,
          {diagnosticCode: 'UNIT_TERM_UNCOMPUTABLE', space: this.spaceName, id: species.id, path: 'units', format: 'simbio'}
        );
        return; // BRAKE
      }
      let isLegal = species.legalTerms.some((x) => term.equal(x));
      if (!isLegal) {
        logger.error(
          `Species "${species.index}" must have an amount or mass unit term for SimBiology export; got "${term}".`,
          {diagnosticCode: 'UNIT_TERM_MISMATCH', space: this.spaceName, id: species.id, path: 'units', format: 'simbio', unitTerm: term.toString(), allowedTerms: species.legalTerms.map((allowed) => allowed.toString())}
        );
        return; // BRAKE
      }
    });

  // checking unitTerm for Reaction
  this.selectByInstanceOf('Reaction')
    .forEach((reaction) => {
      let units = reaction.assignments['ode_'].calcUnit(reaction);
      if (typeof units === 'undefined') {
        //let msg = `Cannot calculate units for Reaction "${reaction.index}" which is not allowed for Simbio.`; // OK if cannot calculate
        //logger.error(msg);
        return; // BRAKE
      }
      let term = units.toTerm(); 
      if (term === undefined) {
        logger.error(
          `Unit term cannot be calculated for reaction "${reaction.index}" during SimBiology export.`,
          {diagnosticCode: 'UNIT_TERM_UNCOMPUTABLE', space: this.spaceName, id: reaction.id, format: 'simbio'}
        );
        return; // BRAKE
      }
      let isLegal = reaction.legalTerms.some((x) => term.equal(x));
      if (!isLegal) {
        logger.error(
          `Reaction "${reaction.index}" has an unsupported calculated unit term: "${term}". Expected "amount/time" or "mass/time".`,
          {diagnosticCode: 'SIMBIO_REACTION_UNIT_TERM_MISMATCH', space: this.spaceName, id: reaction.id, format: 'simbio', unitTerm: term.toString()}
        );
        return; // BRAKE
      }
    });

  let listOfFunctionDefinitions = [...functionDefStorage.values()]
    .filter((functionDef) => !functionDef.isCore);

  // warn about TimeSwitcher and CSwitcher
  let timeSwitchersIds = this.selectByClassName('TimeSwitcher')
    .map((x) => x.id);
  if (timeSwitchersIds.length > 0) {
    logger.warn(
      `TimeSwitcher is not supported in Simbio, got ${timeSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`, 
      {diagnosticCode: 'SBML_TIME_EVENT_CONVERTED_TO_DEVENT', space: this.spaceName, ids: timeSwitchersIds, format: 'simbio'}
    );
  }
  let cSwitchersIds = this.selectByClassName('CSwitcher')
    .map((x) => x.id);
  if (cSwitchersIds.length > 0) {
    logger.warn(
      `CSwitcher is not supported in Simbio, got ${cSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`, 
      {diagnosticCode: 'SBML_CEVENT_CONVERTED_TO_DEVENT', space: this.spaceName, ids: cSwitchersIds, format: 'simbio'}
    );
  }

  return {
    population: this,
    legalUnits,
    listOfFunctionDefinitions // currently not used
  };
};
