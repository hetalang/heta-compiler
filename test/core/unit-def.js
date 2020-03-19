/* global describe, it */
const { UnitDef } = require('../../src/core/unit-def');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  it('Empty UnitDef', () => {
    let simple = new UnitDef;
    expect(simple.units).to.be.equal('');
  });

  it('Correct UnitDef', () => {
    let simple = (new UnitDef).merge({
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    simple._id = 'ud1';
    
    expect(simple.logger).to.has.property('hasErrors', false);
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
    let simple1 = (new UnitDef).merge({
      units: ['xxx']
    });
    expect(simple1.logger).to.has.property('hasErrors', true);

    let simple2 = (new UnitDef).merge({
      units: [{}]
    });
    expect(simple2.logger).to.has.property('hasErrors', true);

  });
});
