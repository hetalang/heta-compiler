/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');
const { ValidationError, BindingError } = require('../../src/heta-error');

describe('Check knitMany() for Species', () => {
  let c = new Container();
  c.load({
    action: 'setNS',
    space: 'one'
  });
  let sp1 = c.load({
    class: 'Species',
    id: 'sp1',
    space: 'one',
    assignments: {start_ : 0}
  });
  it('Set no compartment', () => {
    expect(() => c.knitMany(), 'does not check empty property').throw(ValidationError);
  });
  it('Set lost ref', () => {
    sp1.merge({
      compartment: 'comp1'
    });
    expect(() => c.knitMany(), 'does not check lost ref').throw(BindingError);
  });
  it('Set wrong ref', () => {
    c.load({
      class: 'Record',
      id: 'comp1',
      space: 'one',
      assignments: {ode_: 1}
    });
    expect(() => c.knitMany()).throw(BindingError);
  });
  it('Set good ref', () => {
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
  });
  
  it('have lost ref', () => {
    expect(() => c.knitMany(), 'does not check lost ref').throw(BindingError);
  });
  
  it('Set wrong ref', () => {
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
    expect(() => c.knitMany()).throw(BindingError);
  });

  it('Set good ref', () => {
    c.load({
      class: 'Species',
      id: 'A',
      space: 'one',
      compartment: 'def',
      assignments: { ode_: 1 }
    });
    c.knitMany();
    expect(r1.actors[0]).to.have.property('targetObj');
  });
});
