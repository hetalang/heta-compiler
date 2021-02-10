/*
  UnitTerm is aproximately the same as Unit but simplier.
  It was created to supply checking of unit consistency
*/
const _ = require('lodash');

// legal term names
// empty term [] means dimensionless
const termNames = [
  'amount',
  'length',
  'time',
  'mass',
  'current',
  'temperature'
];

class UnitTerm extends Array {
  constructor(obj = []){
    super();
    obj.length && obj.filter((x) => x.exponent !== 0).forEach((x) => {
      if (termNames.indexOf(x.kind) === -1)
        throw new TypeError('"kind" property of UnitTerm\'s item should one of reserved words, got ' + x.kind);
      this.push({
        kind: x.kind,
        exponent: x.exponent || 1
      });
    });
  }
  multiply(ut = []){
    return this.concat(ut);
  }
  divide(ut = []) {
    let newUt = ut.map((x) => {
      return {kind: x.kind, exponent: -1 * x.exponent};
    });

    return this.concat(newUt);
  }
  simplify() {
    let obj = _.chain(this)
      .groupBy((x) => x.kind)
      .map((x, key) => {
        return {
          kind: key,
          exponent: _.sumBy(x, (y) => y.exponent)
        };
      })
      .filter((x) => x.exponent !== 0)
      .value();

    return new UnitTerm(obj);
  }
  // return true if "this" contains the same components as "ut"
  equal(ut) {
    return this.divide(ut).simplify().length === 0;
  }
}

module.exports = {
  UnitTerm
};
