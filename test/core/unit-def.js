/* global describe, it */
const { UnitDef } = require('../../src/core/unit-def');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  it('Empty UnitDef', () => {
    let simple = new UnitDef;
    expect(simple.units).to.be.undefined;
  });

  it('Correct UnitDef', () => {
    let simple = (new UnitDef).merge({
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    simple._id = 'ud1';
    expect(simple.toQ()).to.be.deep.equal({
      class: 'UnitDef',
      id: 'ud1',
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', multiplier: 1, exponent: -1}
      ]
    });
  });

  it('Wrong input.', () => {
    expect(() => {
      (new UnitDef).merge({
        units: ['xxx']
      });
    }).to.throw(ValidationError);
    expect(() => {
      (new UnitDef).merge({
        units: [{}]
      });
    }).to.throw(ValidationError);
  });
});
