/* global describe, it */
const { UnitDefinition } = require('../src/core/unit-definition');
const should = require('should');

describe('Unit test for UnitDefinition', () => {
  it('Empty UnitDefinition', () => {
    let simple = new UnitDefinition({id: 'ud1'});
    simple.should.has.property('components', []);
  });

  it('Correct UnitDefinition', () => {
    let simple = (new UnitDefinition({id: 'ud1'})).merge({
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    simple.toQ().should.be.deepEqual({
      class: 'UnitDefinition',
      id: 'ud1',
      components: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
  });

  it('Wrong input.', () => {
    should.throws(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: 'xxx'
      });
    });
    should.throws(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: ['xxx']
      });
    });
    should.throws(() => {
      (new UnitDefinition({id: 'ud1'})).merge({
        components: [{}]
      });
    });
  });
});
