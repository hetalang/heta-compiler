const { Namespace } = require('../namespace');
require('./expression');

Namespace.prototype.getMrgsolveImage = function() {
  let { logger } = this.container;
  
  // $ODE uses SOLVERTIME; $MAIN and $TABLE use TIME.
  let image = this.makeDynMSModel(
    'mrgsolve',
    (expr) => expr.toCString(logger, {timeVariable: 'TIME'}),
    (expr) => expr.toCString(logger, {timeVariable: 'SOLVERTIME'})
  );

  // Check for events of type "conditional", "crossing"
  let eventsToCheck = image.events
    .filter((event) => ['conditional', 'crossing'].includes(event.trigger.type))
    .map((event) => event.id);
  if (eventsToCheck.length > 0) { 
    const msg = `Unstable results possible for model "${this.spaceName}" in mrgsolve because CSwitcher/DSwitcher were found. \n\tTry to update "delta" and "hmax" parameters in mrgsolve to improve stability.`;
    logger.warn(msg, {type: 'EventTypeWarning', events: eventsToCheck});
  }

  // a specific dictionary required for "compartment" enumeration in mrgsolve
  // started from 1 for compatibility with mrgsolve
  image.dynamicStatesIndex = {};
  image.dynamic.forEach((state, i) => {
    image.dynamicStatesIndex[state.id] = i + 1;
  });
  // started from 10 to avoid conflicts with reserved numbers 0-4 in mrgsolve
  image.timeEventIndex = {};
  image.timeEvents.forEach((event, i) => {
    image.timeEventIndex[event.id] = i + 10;
  });

  return image;
};
