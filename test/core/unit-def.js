/* global describe, it */
const { UnitDef } = require('../../src/core/unit-def');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  it('Empty UnitDef', () => {
    let simple = new UnitDef;
    expect(simple).to.have.deep.property('components', []);
  });

  it('Correct UnitDef', () => {
    let simple = (new UnitDef).merge({
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    simple._id = 'ud1';
    expect(simple.toQ()).to.be.deep.equal({
      class: 'UnitDef',
      id: 'ud1',
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
  });

  it('Wrong input.', () => {
    expect(() => {
      (new UnitDef).merge({
        components: 'xxx'
      });
    }).to.throw(ValidationError);
    expect(() => {
      (new UnitDef).merge({
        components: ['xxx']
      });
    }).to.throw(ValidationError);
    expect(() => {
      (new UnitDef).merge({
        components: [{}]
      });
    }).to.throw(ValidationError);
  });
});
