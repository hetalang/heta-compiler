/* global describe, it */
const { UnitDefinition } = require('../../src/core/unit-definition');
const { SchemaValidationError } = require('../../src/heta-error');
const should = require('chai').should();

describe('Unit test for UnitDefinition', () => {
  it('Empty UnitDefinition', () => {
    let simple = new UnitDefinition({id: 'ud1'});
    simple.should.has.deep.property('components', []);
  });

  it('Correct UnitDefinition', () => {
    let simple = (new UnitDefinition({id: 'ud1'})).merge({
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    simple.toQ().should.be.deep.equal({
      class: 'UnitDefinition',
      id: 'ud1',
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
  });

  it('Wrong input.', () => {
    should.Throw(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: 'xxx'
      });
    }, SchemaValidationError);
    should.Throw(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: ['xxx']
      });
    }, SchemaValidationError);
    should.Throw(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: [{}]
      });
    }, SchemaValidationError);
  });
});