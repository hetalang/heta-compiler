const { _Size } = require('../core/_size');
const legalUnits = require('./legal-units');

// old version
let _toQ = _Size.prototype.toQ;
// new version
_Size.prototype.toQ = function(options = {}){
  let res = _toQ.call(this, options);

  // unit with transformation to simbio standard
  // if (options.useAnotherUnits) res.units2 = this.units;
  if (options.useAnotherUnits) res.units2 = this.unitsRebased(legalUnits, true);

  return res;
};
