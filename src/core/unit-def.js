const { _Size } = require('./_size');

/*
  example: xxx = nM / kg3
  xxx @UnitDef { units: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef extends _Size {
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.units) res.units = this.unitsParsed;

    return res;
  }
}

module.exports = {
  UnitDef
};
