/* global describe, it */
const { Container } = require('../../src');
//const { QueueError } = require('../../src/builder');
const { expect } = require('chai');

describe('Test correct importNS', () => {
  it('Two namespaces', () => {
    var c = new Container();
    let counter = c.length;
    c.setNS({space: 'one'});
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
    c.load({
      action: 'setNS',
      space: 'one'
    });
    c.load({
      action: 'setNS',
      space: 'two'
    });
    let clone = c.importNS({
      fromSpace: 'one',
      space: 'two',

      prefix: 'one_',
      rename: { comp1: 'comp1', r1: 'r1', t: 't' }
    });
    c.load({
      action: 'insert',
      class: 'Compartment',
      id: 'comp1',
      space: 'two',
      assignments: { start_: '1' }
    });

    expect(c.length - counter).to.be.eq(5 + 2);
    expect(clone).to.be.lengthOf(2 + 1);
    expect(clone[1]).to.have.property('index', 'two::one_k1');

    expect(clone[2]).to.have.property('index', 'two::r1');
    expect(clone[2].actors[0]).to.have.property('target', 'one_A');
    expect(clone[2].assignments.ode_.toString()).to.be.equal('one_k1 * one_A * comp1');

    expect(c.namespaceStorage.get('one')).to.be.lengthOf(2 + 1);
    expect(c.namespaceStorage.get('two')).to.be.lengthOf(3 + 1);
  });
});

/*
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
    expect(clone[1].assignments.ode_.toString()).to.be.equal('one_k1 * one_A * comp1');

    expect(c.storage.selectBySpace('one')).to.be.lengthOf(0);
    expect(c.storage.selectBySpace('two')).to.be.lengthOf(3);
  });
});
*/