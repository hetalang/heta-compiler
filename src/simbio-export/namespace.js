const { Namespace } = require('../namespace');
const legalUnits = require('./legal-units');

Namespace.prototype.getSimbioImage = function() {
  let { logger, functionDefStorage } = this.container;

  // checking unitTerm for Species
  this.selectByInstanceOf('Species')
    .filter((species) => species.isAmount)
    .forEach((species) => {
      if (typeof species.unitsParsed === 'undefined') {
        logger.error(`Units for "${species.index}" is not found which is not allowed for Simbio format when {isAmount: true}.`);
        return; // BRAKE
      }
      let term = species.unitsParsed.toTerm();
      if (term === undefined) {
        let msg = `Unit term cannot be calculated for species "${species.index}" that is not allowed for Simbio format when {isAmount: true}.`;
        logger.error(msg, {type: 'UnitError'});
        return; // BRAKE
      }
      let isLegal = species.legalTerms.some((x) => term.equal(x));
      if (!isLegal) {
        let msg = `Species {isAmount: true} "${species.index}" has wrong unit term. It must be "amount" or "mass", got "${term}".`;
        logger.error(msg, {type: 'UnitError'});
        return; // BRAKE
      }
    });

  // checking unitTerm for Reaction
  this.selectByInstanceOf('Reaction')
    .forEach((reaction) => {
      let units = reaction.assignments['ode_'].calcUnit(reaction);
      if (typeof units === 'undefined') {
        //let msg = `Cannot calculate units for Reaction "${reaction.index}" which is not allowed for Simbio.`; // OK if cannot calculate
        //logger.error(msg, {type: 'UnitError'});
        return; // BRAKE
      }
      let term = units.toTerm(); 
      let isLegal = reaction.legalTerms.some((x) => term.equal(x));
      if (!isLegal) {
        let msg = `Reaction "${reaction.index}" has wrong CALCULATED unit term. It must be "amount/time" or "mass/time", got ${term}`;
        logger.error(msg, {type: 'UnitError'});
        return; // BRAKE
      }
    });

  let listOfFunctionDefinitions = [...functionDefStorage.values()]
    .filter((functionDef) => !functionDef.isCore);

  // warn about TimeSwitcher and CSwitcher
  let timeSwitchersIds = this.selectByClassName('TimeSwitcher')
    .map((x) => x.id);
  if (timeSwitchersIds.length > 0) {
    let msg = `TimeSwitcher is not supported in Simbio, got ${timeSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`;
    logger.warn(msg);
  }
  let cSwitchersIds = this.selectByClassName('CSwitcher')
    .map((x) => x.id);
  if (cSwitchersIds.length > 0) {
    let msg = `CSwitcher is not supported in Simbio, got ${cSwitchersIds.join(', ')}. They will be transformed to DSwitcher.`;
    logger.warn(msg);
  }

  return {
    population: this,
    legalUnits,
    listOfFunctionDefinitions // currently not used
  };
};
