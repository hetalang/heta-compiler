/* global describe, it*/
const { expect } = require('chai');
const { UnitTerm } = require('../../src/core/unit-term');

describe('Simple testing of UnitTerm', () => {
  it('Create and check', () => {
    let ut = new UnitTerm([
      {kind: 'amount', exponent: 1},
      {kind: 'length', exponent: 2},
      {kind: 'time', exponent: -2},
      {kind: 'mass'},
      {kind: 'current', exponent: 0}
    ]);
    expect(ut).to.be.lengthOf(4);
    expect(ut[1]).to.have.property('kind', 'length');
    expect(ut[1]).to.have.property('exponent', 2);
  });

  it('Error: wrong "kind" prop', () => {
    expect(() => new UnitTerm([{kind: 'amount1', exponent: 1}])).to.throw(TypeError);
  });

  it('multiply()', () => {
    let ut0 = new UnitTerm([{kind: 'length', exponent: 2}]);
    let ut1 = new UnitTerm([{kind: 'time', exponent: -1}]);
    let mult = ut0.multiply(ut1);
    expect(mult).to.be.instanceOf(UnitTerm);
    expect(mult).to.be.deep.equal([
      {kind: 'length', exponent: 2},
      {kind: 'time', exponent: -1}
    ]);
  });
  
  it('divide()', () => {
    let ut0 = new UnitTerm([{kind: 'length', exponent: 2}]);
    let ut1 = new UnitTerm([{kind: 'time', exponent: -1}]);
    let mult = ut0.divide(ut1);
    expect(mult).to.be.instanceOf(UnitTerm);
    expect(mult).to.be.deep.equal([
      {kind: 'length', exponent: 2},
      {kind: 'time', exponent: 1}
    ]);
  });

  it('simplify()', () => {
    let ut = new UnitTerm([
      {kind: 'amount', exponent: 1},
      {kind: 'length', exponent: 2},
      {kind: 'amount', exponent: 2},
      {kind: 'time', exponent: -2},
      {kind: 'mass'},
      {kind: 'mass', exponent: -1},
      {kind: 'current', exponent: 0}
    ]);
    let res = ut.simplify();
    expect(res).to.be.instanceOf(UnitTerm);
    expect(res).to.be.deep.equal([
      {kind: 'amount', exponent: 3},
      {kind: 'length', exponent: 2},
      {kind: 'time', exponent: -2}
    ]);
  });

  it('equal()', () => {
    let ut0 = new UnitTerm([
      {kind: 'length', exponent: 3},
      {kind: 'amount', exponent: 1}
    ]);
    let ut1 = new UnitTerm([
      {kind: 'amount', exponent: 1},
      {kind: 'length', exponent: 3}
    ]);
    let res = ut0.equal(ut1)
    expect(res).to.be.true;
  });
  
  it('not equal()', () => {
    let ut0 = new UnitTerm([
      {kind: 'amount', exponent: 1},
      {kind: 'length', exponent: -3}
    ]);
    let ut1 = new UnitTerm([
      {kind: 'amount', exponent: 1},
      {kind: 'length', exponent: 3}
    ]);
    let res = ut0.equal(ut1)
    expect(res).to.be.false;
  });
});
