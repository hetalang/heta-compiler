/* global describe, it */
const { Record } = require('../../src/core/record');
const { Expression } = require('../../src/core/expression');
const { expect } = require('chai');

describe('Unit tests for Record.', () => {
  it('Minimal record.', () => {
    let simple = new Record({id: 'k1', space: 'one'});
    expect(simple).to.have.property('id', 'k1');
    expect(simple).to.have.property('space', 'one');
  });

  it('Merge empty.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({});
    expect(simple).to.have.property('id', 'k1');
    expect(simple).to.have.property('space', 'one');
  });

  it('Set static expression with numeric.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({
      assignments: { start_: { expr: '1.1' } }
    });
    expect(simple).to.have.nested.property('assignments.start_').instanceOf(Expression);
  });

  it('Set static expression.', () => {
    let simple = (new Record({id: 'k1', space: 'one'})).merge({
      assignments: { start_: { expr: 'x*y' } }
    });
    expect(simple).to.have.nested.property('assignments.start_').instanceOf(Expression);
  });

  it('Check toQ for expression Record.', () => {
    let simple = (new Record({id: 'r1', space: 'default__'})).merge({
      title: 'complex record',
      assignments: { ode_: { expr: 'm*c^2' } },
      units: 'J'
    });
    expect(simple.toQ()).to.be.deep.equal({
      class: 'Record',
      id: 'r1',
      space: 'default__',
      title: 'complex record',
      assignments: { ode_: { expr: 'm * c ^ 2' } },
      units: 'J'
    });
  });
});
