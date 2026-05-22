const { index } = require('mathjs');
const { Namespace } = require('../namespace');
require('./expression');

Namespace.prototype.getMrgsolveImage = function() {
  let { logger } = this.container;
  
  let image = this.makeDynMSModel('c');

  // a specific dictionary required for "compartment" enumeration in mrgsolve
  // started from 1 for compatibility with mrgsolve
  image.dynamicStatesIndex = {};
  image.states.filter((state) => !state.static).forEach((state, i) => {
    image.dynamicStatesIndex[state.id] = i + 1;
  });

  return image;
};
