/*
  UnitTerm is approximately the same as Unit but simpler.
  It was created to supply checking of unit consistency
*/

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
        throw new TypeError('"kind" property of UnitTerm\'s item should be one of selected words, got ' + x.kind);
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
    let obj = this.reduce((accumulator, value) => {
      !accumulator[value.kind] && (accumulator[value.kind] = []);
      accumulator[value.kind].push(value);
      return accumulator;
    }, {});
    let arr = Object.entries(obj)
      .map(([key, x]) => {
        return {
          kind: key,
          exponent: x.reduce((acc, y) => acc + y.exponent, 0)
        };
      })
      .filter((x) => x.exponent !== 0);

    return new UnitTerm(arr);
  }
  // return true if "this" contains the same components as "ut"
  equal(ut) {
    return this.divide(ut).simplify().length === 0;
  }
  toString(){
    if (this.length === 0) {
      return '-'; // BRAKE
    }

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
