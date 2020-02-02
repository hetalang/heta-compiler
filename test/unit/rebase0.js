/* global describe, it*/
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

describe('Testing rebase0', () => {
  let test = {
    source: Unit.fromQ([
      {kind: 'kg', exponent: 1, multiplier: 1},
      {kind: 'L', exponent: -1, multiplier: 1}
    ]),
    trans: {
      kg: [{kind:'g', multiplier: 1e3}],
      L: [{kind:'cm', multiplier: 1e1, 'exponent': 3}]
    },
    rebased: '(1e+3 g)/(1e+1 cm)^3'
  };

  it('Check "kg/L" to "(1e+3 g)/(1e+1 cm)^3"', () => {
    let rebased = test.source.rebase0(test.trans).simplify();
    expect(rebased.toString()).to.be.equal(test.rebased);
  });

});
