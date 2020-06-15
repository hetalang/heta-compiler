/* global describe, it */
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

const correctUnits = [
  {
    str0: 'L*mg2',
    q: [{kind: 'L', exponent: 1, multiplier: 1}, {kind: 'mg', exponent: 2, multiplier: 1}],
    str: 'L*mg^2'
  },
  {
    str0: '(1e0 L)^1/(1.1 mg)2',
    q: [{kind: 'L', exponent: 1, multiplier: 1}, {kind: 'mg', exponent: -2, multiplier: 1.1}],
    str: 'L/(1.1e+0 mg)^2'
  },
  {
    str0: '(1e2 L)^1.3/(1.1e-3 mg)2.2',
    q: [{kind: 'L', exponent: 1.3, multiplier: 1e2}, {kind: 'mg', exponent: -2.2, multiplier: 1.1e-3}],
    str: '(1e+2 L)^1.3/(1.1e-3 mg)^2.2'
  }
];

describe('Testing units with multipliers', () => {
  correctUnits.forEach((x) => {
    describe(`Parsing "${x.str0}"`, () => {
      let unit;
      
      it('No errors', () => {
        unit = Unit.parse(x.str0);
      });

      it('toQ()', () => {
        expect(unit.toQ()).to.be.deep.equal(x.q);
      });

      it('toString()', () => {
        expect(unit.toString()).to.be.equal(x.str);
      });

    });
  });
});
