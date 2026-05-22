const { index } = require('mathjs');
const { Namespace } = require('../namespace');
require('./expression');

Namespace.prototype.getMrgsolveImage = function() {
  let { logger } = this.container;
  
  let image = this.makeDynMSModel('mrgsolve', (expr) => expr.toCString(logger, {timeVariable: 'TIME'}));

  // a specific dictionary required for "compartment" enumeration in mrgsolve
  // started from 1 for compatibility with mrgsolve
  image.dynamicStatesIndex = {};
  image.states.filter((state) => !state.static).forEach((state, i) => {
    image.dynamicStatesIndex[state.id] = i + 1;
  });
  // started from 10 to not conflict with reserved numbers 0-4
  image.timeEventIndex = {};
  image.events.filter((event) => event.type === 'time').forEach((event, i) => {
    image.timeEventIndex[event.id] = i + 10;
  });

  return image;
};
