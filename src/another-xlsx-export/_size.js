const { _Size } = require('../core/_size');
//const legalUnits = require('./legal-units');

_Size.prototype.toFlat = function(options = {}){

  //let res = super.toFlat(options);
  let res = _Size.__proto__.prototype.toFlat.call(this, options);

  // res.unitsAnother = this.unitsRebased(legalUnits, usePefix = false); // with unit transformation
  if (this.units) res.unitsAnother = this.units; // units without transformation

  return res;
};
