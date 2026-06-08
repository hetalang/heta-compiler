const { Namespace } = require('../namespace');
const legalUnits = require('./legal-units');

function hasSimbioSensitiveUnitsCheck(expr) {
  if (!expr || !expr.exprParsed) return false;

  let nodes = expr.exprParsed.filter((node) => {
    let isPowOperator = node.type === 'OperatorNode' && node.fn === 'pow';
    let isSensitiveFunction = node.type === 'FunctionNode'
      && ['pow', 'nthRoot', 'piecewise'].indexOf(node.fn?.name) !== -1;

    return isPowOperator || isSensitiveFunction;
  });

  return nodes.length > 0;
}

Namespace.prototype.getSimbioImage = function() {
  let { logger, functionDefStorage } = this.container;

  // Simbio-specific dimensional checks for expression rules.
  this.selectByInstanceOf('Record')
    .filter((record) => record.className !== 'Reaction')
    .forEach((record) => {
      Object.values(record.assignments).forEach((expr) => {
        if (!expr || expr.num !== undefined) return;
        if (!hasSimbioSensitiveUnitsCheck(expr)) return;
        expr.calcUnit(record, { policy: 'simbio' });
      });
    });

  ['DSwitcher', 'CSwitcher', 'StopSwitcher']
    .forEach((className) => {
      this.selectByClassName(className)
        .forEach((switcher) => {
          if (!switcher.trigger || !hasSimbioSensitiveUnitsCheck(switcher.trigger)) return;
          switcher.trigger.calcUnit(switcher, { policy: 'simbio' });
        });
    });

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
      let units = reaction.assignments['ode_'].calcUnit(reaction, { policy: 'simbio' });
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
