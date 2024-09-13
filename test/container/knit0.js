/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');

describe('Check knitMany() for Species', () => {
  let c;
  let sp1;

  it('Initialize container', () => {
    c = new Container();
    c.load({
      action: 'setNS',
      space: 'one'
    });
    sp1 = c.load({
      class: 'Species',
      id: 'sp1',
      space: 'one',
      assignments: {start_ : 0}
    });

    expect(c.hetaErrors()).to.be.lengthOf(0);
  });

  it('Set no compartment', () => {
    c.defaultLogs.length = 0;
    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });

  it('Set lost ref', () => {
    c.defaultLogs.length = 0;
    sp1.merge({
      compartment: 'comp1'
    });
    c.knitMany();
    console.log(c.hetaErrors());
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });
  
  it('Set wrong ref', () => {
    c.defaultLogs.length = 0;
    c.load({
      class: 'Record',
      id: 'comp1',
      space: 'one',
      assignments: {ode_: 1}
    });
    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });

  it('Set good ref', () => {
    c.defaultLogs.length = 0;
    c.load({
      class: 'Compartment',
      id: 'comp1',
      space: 'one',
      assignments: {ode_: 1}
    });
    c.knitMany();
    expect(sp1).to.have.property('compartmentObj');
  });
});

describe('Check knitMany() for Reaction', () => {
  let c, r1;

  it('Create platform', () => {
    c = new Container();
    c.setNS({space: 'one'});
    r1 = c.load({
      class: 'Reaction',
      id: 'r1',
      space: 'one',
      actors: 'A=>',
      assignments: {ode_: 1}
    });
    expect(c.hetaErrors()).to.be.lengthOf(0);
  });
  
  it('have lost ref', () => {
    c.defaultLogs.length = 0;
    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(1);
  });
  
  it('Set wrong ref', () => {
    c.defaultLogs.length = 0;
    c.load({
      class: 'Record',
      id: 'A',
      space: 'one',
      compartment: 'def'
    });
    c.load({
      class: 'Compartment',
      id: 'def',
      space: 'one',
      assignments: {start_: 1.1}
    });
    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(2);
  });

  it('Set good ref', () => {
    c.defaultLogs.length = 0;
    c.load({
      class: 'Species',
      id: 'A',
      space: 'one',
      compartment: 'def',
      assignments: { ode_: 1 }
    });
    c.knitMany();
    expect(c.hetaErrors()).to.be.lengthOf(0);
    expect(r1.actors[0]).to.have.property('targetObj');
  });
});
