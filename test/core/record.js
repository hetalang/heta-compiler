/* global describe, it */
const { Record } = require('../../src/core/record');
const { Numeric } = require('../../src/core/numeric');
const { Expression } = require('../../src/core/expression');
const should = require('chai').should();

describe('Unit tests for Record.', () => {
  it('Minimal record.', () => {
    let simple = new Record({id: 'k1', space: 'one'});
    simple.should.has.property('id', 'k1');
    simple.should.has.property('space', 'one');
  });

  it('Merge empty.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({});
    simple.should.has.property('id', 'k1');
    simple.should.has.property('space', 'one');
  });

  it('Set static numeric.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: {num: 1.1}}
    });
    simple.should.has.nested.property('variable.size').instanceOf(Numeric);
  });

  it('Set static expression.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({
      variable: {kind: 'static', size: {expr: 'x*y'}}
    });
    simple.should.has.nested.property('variable.size').instanceOf(Expression);
  });

  it('Check toQ for expression Record.', () => {
    let simple = (new Record({id: 'r1'})).merge({
      title: 'complex record',
      variable: {kind: 'rule', size: {expr: 'm*c^2'}, units: 'J'}
    });
    simple.toQ().should.be.deep.equal({
      class: 'Record',
      id: 'r1',
      space: 'default__',
      title: 'complex record',
      variable: {kind: 'rule', size: {expr: 'm * c ^ 2'}, units: 'J'}
    });
  });
});
