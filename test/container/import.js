/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');

describe('Test correct import', () => {

  it('Create and import Const', () => {
    var c = new Container();
    c.setNS({space: 'one'});
    c.setNS({space: 'two'});
    let counter = c.length; //set number of components
    c.load({
      action: 'insert',
      class: 'Const',
      id: 'k1',
      space: 'one',
      num: 1
    });
    let clone = c.import({
      fromId: 'k1',
      fromSpace: 'one',
      id: 'k2',
      space: 'two'
    });

    expect(c.logger.hasErrors).to.be.false;
    expect(c.length - counter).to.be.eq(2);
    expect(clone).to.have.property('index', 'two::k2');
    c.logger.resetErrors();
  });

  it('import of not existed Const', () => {
    let c = new Container();
    let counter = c.length;
    c.import({
      fromId: 'k1',
      fromSpace: 'one',
      id: 'k2',
      space: 'two'
    });

    expect(c.logger.hasErrors).to.be.true;
    expect(c.length - counter).to.be.eq(0);
    c.logger.resetErrors();
  });

  it('Create and import Process', () => {
    var c = new Container();
    c.setNS({space: 'one'});
    c.setNS({space: 'two'});
    let counter = c.length;
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
    let clone = c.import({
      fromId: 'p1',
      fromSpace: 'one',
      id: 'p2',
      space: 'two',
      prefix: 'pr_',
      suffix: '_suf',
      rename: { y: 'z'}
    });

    expect(c.logger.hasErrors).to.be.false;
    expect(c.length - counter).to.be.eq(2);
    expect(clone).to.have.property('index', 'two::p2');
    expect(clone.actors[1]).to.have.property('target', 'pr_A_suf');
    expect(clone.actors[0]).to.have.property('target', 'z');
    expect(clone.assignments.ode_.toString()).to.be.equal('pr_x_suf * z');
    c.logger.resetErrors();
  });
});
/*
describe('Test correct move', () => {

  it('Create and move Const', () => {
    var c = new Container();
    c.load({
      action: 'insert',
      class: 'Const',
      id: 'k1',
      space: 'one',
      num: 1
    });
    let clone = c.move({
      fromId: 'k1',
      fromSpace: 'one',
      id: 'k2',
      space: 'two'
    });

    expect(c).to.be.lengthOf(1);
    expect(clone).to.have.property('index', 'two::k2');
  });
});
*/