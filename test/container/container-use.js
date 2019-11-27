/* global describe, it */
const { Container } = require('../../src');
const { QueueError } = require('../../src/builder');
const { expect } = require('chai');

describe('Test correct use', () => {

  it('Create and use Const', () => {
    var c = new Container();
    c.load({
      action: 'insert',
      class: 'Const',
      id: 'k1',
      space: 'one',
      num: 1
    });
    let clone = c.use({
      id: 'k1',
      space: 'one',
      toId: 'k2',
      toSpace: 'two'
    });

    expect(c).to.be.lengthOf(2);
    expect(clone).to.have.property('index', 'two::k2');
  });

  it('use of not existed Const', () => {
    var c = new Container();
    expect(() => {
      c.use({
        id: 'k1',
        space: 'one',
        toId: 'k2',
        toSpace: 'two'
      });
    }).to.throw(QueueError);
    expect(c).to.be.lengthOf(0);
  });

  it('Create and use Process', () => {
    var c = new Container();
    c.load({
      action: 'insert',
      class: 'Process',
      id: 'p1',
      space: 'one',
      actors: 'y => 2A',
      assignments: {
        ode_: 'x*y'
      }
    });
    let clone = c.use({
      id: 'p1',
      space: 'one',
      toId: 'p2',
      toSpace: 'two',
      prefix: 'pr_',
      suffix: '_suf',
      rename: { y: 'z'}
    });

    expect(c).to.be.lengthOf(2);
    expect(clone).to.have.property('index', 'two::p2');
    expect(clone.actors[1]).to.have.property('target', 'pr_A_suf');
    expect(clone.actors[0]).to.have.property('target', 'z');
    expect(clone.assignments.ode_).to.have.property('expr', 'pr_x_suf * z');
  });
});
