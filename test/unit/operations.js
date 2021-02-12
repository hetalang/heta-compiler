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

describe('Test operations for Unit', () => {
  let test = {
    in1: [
      { kind: 'kg', multiplier: 1e3, exponent: 2 }, // (1e3 kg)^2
      { kind: 'kg', multiplier: 1e-1, exponent: -1 } // 1/(1e-1 kg)
    ],
    res1: [
      { kind: 'kg', multiplier: 1e7, exponent: 1 } // (1e7 kg)
    ],
    in2: [
      { kind: 'kg', multiplier: 1e3, exponent: 1 }, // (1e3 kg)
      { kind: 'kg', multiplier: 1e-1, exponent: -1 } // 1/(1e-1 kg)
    ],
    res2: [{ kind: '', multiplier: 1e4, exponent: 1 }], // 1e4
  };

  it('Check simplify 1:', () => {
    let res = Unit.fromQ(test.in1).simplify();
    let res1 = Unit.fromQ(test.res1);
    expect(res).to.be.deep.equal(res1);
  });

  it('Check simplify 2:', () => {
    let res = Unit.fromQ(test.in2).simplify();
    let res2 = Unit.fromQ(test.res2);
    expect(res).to.be.deep.equal(res2);
  });
});

describe('Test Units equality', () => {
  it('The same', () => {
    let unit0 = Unit.parse('kg/L');
    let unit1 = Unit.parse('kg/L');
    expect(unit0.equal(unit1)).to.be.true;
  });
  it('Same with variations', () => {
    let unit0 = Unit.parse('kg/L');
    let unit1 = Unit.parse('1/L*kg');
    expect(unit0.equal(unit1)).to.be.true;
  });
  it('Not equal', () => {
    let unit0 = Unit.parse('kg/L');
    let unit1 = Unit.parse('kg2/L');
    expect(unit0.equal(unit1)).to.be.false;
  });
  it('With multiplier equal', () => {
    let unit0 = Unit.parse('(1e-3kg)/L');
    let unit1 = Unit.parse('/L*(1e-3kg)');
    expect(unit0.equal(unit1)).to.be.true;
  });
  it('With multiplier not equal', () => {
    let unit0 = Unit.parse('(1e-3kg)/L');
    let unit1 = Unit.parse('/L*kg');
    expect(unit0.equal(unit1)).to.be.false;
  });
  it('Argument error', () => {
    let unit0 = Unit.parse('kg/L');
    let unit1 = 'kg2/L';
    expect(() => unit0.equal(unit1)).to.throw(TypeError);
  });
});
