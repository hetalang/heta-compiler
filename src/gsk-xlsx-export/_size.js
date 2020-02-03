const { _Size } = require('../core/_size');
//const legalUnits = require('./legal-units');

_Size.prototype.toFlat = function(options = {}){

  //let res = super.toFlat(options);
  let res = _Size.__proto__.prototype.toFlat.call(this, options);

  // res.unitsGSK = this.unitsRebased(legalUnits, usePefix = false); // with unit transformation
  res.unitsGSK = this.units; // units without transformation

  return res;
};
