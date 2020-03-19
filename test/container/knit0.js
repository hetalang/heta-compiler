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

    expect(c.logger).to.have.property('hasErrors', false);
  });

  it('Set no compartment', () => {
    c.logger.reset();
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('Set lost ref', () => {
    c.logger.reset();
    sp1.merge({
      compartment: 'comp1'
    });
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors', true);
  });
  
  it('Set wrong ref', () => {
    c.logger.reset();
    c.load({
      class: 'Record',
      id: 'comp1',
      space: 'one',
      assignments: {ode_: 1}
    });
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('Set good ref', () => {
    c.logger.reset();
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
    expect(c.logger).to.have.property('hasErrors', false);
  });
  
  it('have lost ref', () => {
    c.logger.reset();
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors', true);
  });
  
  it('Set wrong ref', () => {
    c.logger.reset();
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
    expect(c.logger).to.have.property('hasErrors', true);
  });

  it('Set good ref', () => {
    c.logger.reset();
    c.load({
      class: 'Species',
      id: 'A',
      space: 'one',
      compartment: 'def',
      assignments: { ode_: 1 }
    });
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors', false);
    expect(r1.actors[0]).to.have.property('targetObj');
  });
});
