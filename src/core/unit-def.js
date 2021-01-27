const { Unit } = require('./unit');

/*
  // example:  unitDef1 = nM / kg3
  unitDef1 #unitDef { units: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef {
  constructor(q, isCore = false, logger){
    this.unitsParsed = new Unit(); // [] means the unit is base

    // check arguments here
    let valid = UnitDef.isValid(q, logger);

    if (valid) {
      if (q.units) {
        if (typeof q.units === 'string')
          this.unitsParsed = Unit.parse(q.units);
        else
          this.unitsParsed = Unit.fromQ(q.units);
      }
    }

    return this;
  }
  static isValid(q, logger){ // TODO: 
    return true;
  }
}

module.exports = {
  UnitDef
};
