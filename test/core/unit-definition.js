/* global describe, it */
const { UnitDefinition } = require('../../src/core/unit-definition');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for UnitDefinition', () => {
  it('Empty UnitDefinition', () => {
    let simple = new UnitDefinition({id: 'ud1'});
    expect(simple).to.have.deep.property('components', []);
  });

  it('Correct UnitDefinition', () => {
    let simple = (new UnitDefinition({id: 'ud1'})).merge({
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    expect(simple.toQ()).to.be.deep.equal({
      class: 'UnitDefinition',
      id: 'ud1',
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
  });

  it('Wrong input.', () => {
    expect(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: 'xxx'
      });
    }).to.throw(ValidationError);
    expect(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: ['xxx']
      });
    }).to.throw(ValidationError);
    expect(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: [{}]
      });
    }).to.throw(ValidationError);
  });
});
