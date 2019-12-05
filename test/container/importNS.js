/* global describe, it */
const { Container } = require('../../src');
//const { QueueError } = require('../../src/builder');
const { expect } = require('chai');

describe('Test correct importNS', () => {
  it('Two namespaces', () => {
    var c = new Container();
    c.load({
      action: 'insert',
      class: 'Const',
      id: 'k1',
      space: 'one',
      num: 1e-3
    });
    c.load({
      action: 'insert',
      class: 'Reaction',
      id: 'r1',
      space: 'one',
      assignments: { ode_: 'k1 * A *comp1' },
      actors: 'A => 2B'
    });
    let clone = c.importNS({
      fromSpace: 'one',
      space: 'two',

      prefix: 'one_',
      rename: { comp1: 'comp1', r1: 'r1' }
    });
    c.load({
      action: 'insert',
      class: 'Compartment',
      id: 'comp1',
      space: 'two',
      assignments: { start_: '1' }
    });

    expect(c).to.be.lengthOf(5);
    expect(clone).to.be.lengthOf(2);
    expect(clone[0]).to.have.property('index', 'two::one_k1');

    expect(clone[1]).to.have.property('index', 'two::r1');
    expect(clone[1].actors[0]).to.have.property('target', 'one_A');
    expect(clone[1].assignments.ode_).to.have.property('expr', 'one_k1 * one_A * comp1');

    expect(c.storage.selectBySpace('one')).to.be.lengthOf(2);
    expect(c.storage.selectBySpace('two')).to.be.lengthOf(3);
  });
});


describe('Test correct moveNS', () => {
  it('Two namespaces', () => {
    var c = new Container();
    c.load({
      action: 'insert',
      class: 'Const',
      id: 'k1',
      space: 'one',
      num: 1e-3
    });
    c.load({
      action: 'insert',
      class: 'Reaction',
      id: 'r1',
      space: 'one',
      assignments: { ode_: 'k1 * A *comp1' },
      actors: 'A => 2B'
    });
    let clone = c.moveNS({
      fromSpace: 'one',
      space: 'two',

      prefix: 'one_',
      rename: { comp1: 'comp1', r1: 'r1' }
    });
    c.load({
      action: 'insert',
      class: 'Compartment',
      id: 'comp1',
      space: 'two',
      assignments: { start_: '1' }
    });

    expect(c).to.be.lengthOf(3);
    expect(clone).to.be.lengthOf(2);
    expect(clone[0]).to.have.property('index', 'two::one_k1');

    expect(clone[1]).to.have.property('index', 'two::r1');
    expect(clone[1].actors[0]).to.have.property('target', 'one_A');
    expect(clone[1].assignments.ode_).to.have.property('expr', 'one_k1 * one_A * comp1');

    expect(c.storage.selectBySpace('one')).to.be.lengthOf(0);
    expect(c.storage.selectBySpace('two')).to.be.lengthOf(3);
  });
});
