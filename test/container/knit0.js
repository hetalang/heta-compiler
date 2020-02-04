/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');
const { ValidationError, BindingError } = require('../../src/heta-error');

describe('Check knit() for Species', () => {
  let c = new Container();
  c.load({
    action: 'setNS',
    space: 'one'
  });
  let sp1 = c.load({
    class: 'Species',
    id: 'sp1',
    space: 'one'
  });
  it('Set no compartment', () => {
    expect(() => c.knit(), 'does not check empty property').throw(ValidationError);
  });
  it('Set lost ref', () => {
    sp1.merge({
      compartment: 'comp1'
    });
    expect(() => c.knit(), 'does not check lost ref').throw(BindingError);
  });
  it('Set wrong ref', () => {
    c.load({
      class: 'Record',
      id: 'comp1',
      space: 'one'
    });
    expect(() => c.knit()).throw(BindingError);
  });
  it('Set good ref', () => {
    c.load({
      class: 'Compartment',
      id: 'comp1',
      space: 'one'
    });
    c.knit();
    expect(sp1).to.have.property('compartmentObj');
  });
});

describe('Check knit() for Reaction', () => {
  let c, r1;

  it('Create platform', () => {
    c = new Container();
    c.setNS({space: 'one'});
    r1 = c.load({
      class: 'Reaction',
      id: 'r1',
      space: 'one',
      actors: 'A=>'
    });
  });
  
  it('have lost ref', () => {
    expect(() => c.knit(), 'does not check lost ref').throw(BindingError);
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
      space: 'one'
    });
    expect(() => c.knit()).throw(BindingError);
  });

  it('Set good ref', () => {
    c.load({
      class: 'Species',
      id: 'A',
      space: 'one',
      compartment: 'def'
    });
    c.knit();
    expect(r1.actors[0]).to.have.property('targetObj');
  });
});
