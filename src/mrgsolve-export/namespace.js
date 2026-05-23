const { index } = require('mathjs');
const { Namespace } = require('../namespace');
require('./expression');

Namespace.prototype.getMrgsolveImage = function() {
  let { logger } = this.container;
  
  // TODO: need to refactor the code because currently this result in wrong TIME variable in $ODE block
  // https://mrgsolve.org/user-guide/specification.html#time
  // We must use SOLVERTIME in $ODE
  let image = this.makeDynMSModel(
    'mrgsolve',
    (expr) => expr.toCString(logger, {timeVariable: 'TIME'})
  );

  // Check for events of type "conditional", "crossing"
  let eventsToCheck = image.events
    .filter((event) => ['conditional', 'crossing'].includes(event.trigger.type))
    .map((event) => event.id);
  if (eventsToCheck.length > 0) { 
    const msg = `Unstable results possible for model "${this.spaceName}", CSwitcher/DSwitcher were found. They use step-based event detection based on "delta" parameter.`;
    logger.warn(msg, {type: 'EventTypeWarning', events: eventsToCheck});
  }

  // a specific dictionary required for "compartment" enumeration in mrgsolve
  // started from 1 for compatibility with mrgsolve
  image.dynamicStatesIndex = {};
  image.states.filter((state) => !state.static).forEach((state, i) => {
    image.dynamicStatesIndex[state.id] = i + 1;
  });
  // started from 10 to avoid conflicts with reserved numbers 0-4 in mrgsolve
  image.timeEventIndex = {};
  image.events.filter((event) => event.trigger.type === 'time').forEach((event, i) => {
    image.timeEventIndex[event.id] = i + 10;
  });

  return image;
};
