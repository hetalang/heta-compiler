const { _Size } = require('./_size');
const { Unit } = require('./unit');

/*
  example: xxx = nM / kg3
  unitDef1 @UnitDef { units: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef extends _Size {
  constructor(isCore = false){
    super(isCore);
    this.unitsParsed = new Unit(); // [] means the unit is base
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.unitsParsed) {
      res.units = this.unitsParsed.toQ(options);
    }

    return res;
  }
}

module.exports = {
  UnitDef
};
