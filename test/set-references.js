/* global describe, it */
const { Container } = require('../src');
const { expect } = require('chai');

describe('Check setReferences() for Species', () => {
  let c = new Container();
  let sp1 = c.load({
    class: 'Species',
    id: 'sp1',
    space: 'one'
  });
  it('Set no compartment', () => {
    expect(() => c.setReferences(), 'does not check empty property').throw();
  });
  it('Set lost ref', () => {
    sp1.merge({
      compartment: 'comp1'
    });
    expect(() => c.setReferences(), 'does not check lost ref').throw();
  });
  it('Set wrong ref', () => {
    c.load({
      class: 'Record',
      id: 'comp1',
      space: 'one'
    });
    expect(() => c.setReferences()).throw();
  });
  it('Set good ref', () => {
    c.load({
      class: 'Compartment',
      id: 'comp1',
      space: 'one'
    });
    c.setReferences();
    expect(sp1).to.have.property('compartmentObj');
  });
});

describe('Check setReferences() for Reaction', () => {
  let c = new Container();
  let r1 = c.load({
    class: 'Reaction',
    id: 'r1',
    space: 'one',
    actors: 'A=>'
  });
  
  it('have lost ref', () => {
    expect(() => c.setReferences(), 'does not check lost ref').throw();
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
    expect(() => c.setReferences()).throw();
  });

  it('Set good ref', () => {
    c.load({
      class: 'Species',
      id: 'A',
      space: 'one',
      compartment: 'def'
    });
    c.setReferences();
    expect(r1.actors[0]).to.have.property('targetObj');
  });
});
