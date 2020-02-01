const { _Size } = require('./_size');
const _ = require('lodash');
const { Unit } = require('./unit');

/*
  example: xxx = nM / kg3
  xxx @UnitDef { units: [
    { kind: nM, multiplier: 1, exponent: 1 },
    { kind: kg, multiplier: 1, exponent: -3 }
  ]};
*/
class UnitDef extends _Size {
  /*
    undefined means the unit is base
  */
  rebased(legalUnits = []){
    if (legalUnits.indexOf(this.id) !== -1) { // current unit is legal
      return undefined;
    } else if (this.unitsParsed === undefined) { // current level is illegal
      throw new Error('Not defined unit: ' + this.id);
    } else { // see deeper level
      let unit = new Unit();
      this.unitsParsed.forEach((x) => {
        if (legalUnits.indexOf(x.kind) !== -1) {
          let clearedUnit =_.pick(x, ['kind', 'exponent', 'multiplier']);
          unit.push(clearedUnit);
        } else {
          let deepRebase = x.kindObj
            .rebased(legalUnits)
            .map((y) => {
              return {
                kind: y.kind,
                exponent: y.exponent * x.exponent,
                multiplier: y.multiplier * x.multiplier**(1/y.exponent)
              };
            });
          unit = unit.concat(deepRebase);
        }
      });

      return unit;
    }
  }
}

module.exports = {
  UnitDef
};
