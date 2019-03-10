/* global describe, it */
const { Quantity } = require('../src/core/quantity');
const { Numeric } = require('../src/core/numeric');
const { Expression } = require('../src/core/expression');
const should = require('should');

describe('Unit tests for Quantity.', () => {
  it('Minimal quantity.', () => {
    let simple = new Quantity({id: 'k1', space: 'one'});
    simple.should.has.property('id', 'k1');
    simple.should.has.property('space', 'one');
  });

  it('Merge empty.', () => {
    let simple = (new Quantity({id: 'k1', space: 'one'})).merge({});
    simple.should.has.property('id', 'k1');
    simple.should.has.property('space', 'one');
  });

  it('Set static numeric 1.', () => {
    let simple = (new Quantity({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: 1.1}
    });
    simple.should.has.propertyByPath('variable','size').instanceOf(Numeric);
  });

  it('Set static numeric 2.', () => {
    let simple = (new Quantity({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: {num: 1.1}}
    });
    simple.should.has.propertyByPath('variable','size').instanceOf(Numeric);
  });

  it('Set static expression 1.', () => {
    let simple = (new Quantity({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: 'x*y'}
    });
    simple.should.has.propertyByPath('variable','size').instanceOf(Expression);
  });

  it('Set static expression 2.', () => {
    let simple = (new Quantity({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: {expr: 'x*y'}}
    });
    simple.should.has.propertyByPath('variable','size').instanceOf(Expression);
  });

  it('Check toQ for expression Quantity.', () => {
    let simple = (new Quantity({id: 'r1'})).merge({
      title: 'complex quantity',
      variable: {kind: 'rule', size: {expr: 'm*c^2'}, units: 'J'}
    });
    simple.toQ().should.be.deepEqual({
      class: 'Quantity',
      id: 'r1',
      space: 'default__',
      title: 'complex quantity',
      variable: {kind: 'rule', size: {expr: 'm * c ^ 2'}, units: 'J'}
    });
  });
});