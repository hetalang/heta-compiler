/* global describe, it*/
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

describe('Checking operations', () => {
  let test = {
    in1: 'uM/mL',
    in2: 'kg',
    in3: 'kg/h',
    res1: 'uM/mL*kg',
    res2: 'uM/mL/kg',
    res3: '1/h'
  };

  it('Check multiply:', () => {
    let x0 = Unit.parse(test.in1);
    let x1 = Unit.parse(test.in2);
    let res = x0.multiply(x1).simplify().toString();
    expect(res).to.be.equal(test.res1);
  });

  it('Check divide:', () => {
    let x0 = Unit.parse(test.in1);
    let x1 = Unit.parse(test.in2);
    let res = x0.divide(x1).simplify().toString();
    expect(res).to.be.equal(test.res2);
  });

  it('Check simplify:', () => {
    let x0 = Unit.parse(test.in3);
    let x1 = Unit.parse(test.in2);
    let res = x0.divide(x1).simplify().toString();
    expect(res).to.be.equal(test.res3);
  });
});

describe('Test operations for UnitGeneral', () => {
  let test = {
    in1: [
      { kind: 'kg', multiplier: 1e3, exponent: 2 }, // (1e3 kg)^2
      { kind: 'kg', multiplier: 1e-1, exponent: -1 } // 1/(1e-1 kg)
    ],
    res1: [
      { kind: 'kg', multiplier: 1, exponent: 1 } // 1e7 (kg)
    ],
    in2: [
      { kind: 'kg', multiplier: 1e3, exponent: 1 }, // (1e3 kg)
      { kind: 'kg', multiplier: 1e-1, exponent: -1 } // 1/(1e-1 kg)
    ],
    res2: [], // 1e4
    
  };

  it('Check simplify 1:', () => {
    let res = Unit.fromQ(test.in1).simplify();
    let res1 = Unit.fromQ(test.res1);
    expect(res).to.be.deep.equal(res1);
    expect(res.multiplier).to.be.equal(1e7);
  });

  it('Check simplify 2:', () => {
    let res = Unit.fromQ(test.in2).simplify();
    let res2 = Unit.fromQ(test.res2);
    expect(res).to.be.deep.equal(res2);
    expect(res.multiplier).to.be.equal(1e4);
  });
});
