/*
  UnitTerm is approximately the same as Unit but simpler.
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
    obj.length && obj.forEach((x) => { // filter((x) => x.exponent !== 0)
      if (termNames.indexOf(x.kind) === -1)
        throw new TypeError('"kind" property of UnitTerm\'s item should one of reserved words, got ' + x.kind);
      this.push({
        kind: x.kind,
        exponent: (typeof x.exponent !== 'undefined') ? x.exponent : 1
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
  power(n = 1){
    if (typeof n !== 'number') throw new TypeError('n in power must be a Number');

    let res = this.map((x) => {
      return {
        kind: x.kind,
        exponent: n * x.exponent
      };
    });

    return res;
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
  toString(){
    return this.map((item, i) => {
      let exponentString = (item.exponent === 1 || item.exponent === -1)
        ? ''
        : '^' + Math.abs(item.exponent);
      let kindExponentString = item.kind + exponentString;
      if (i === 0 && item.exponent > 0) {
        var sign = '';
      } else if (item.exponent < 0) {
        sign = '/';
      } else {
        sign = '*';
      }

      return sign + kindExponentString;
    }).join('');
  }
}

module.exports = {
  UnitTerm
};
