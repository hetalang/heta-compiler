/* global describe, it */
const { Container } = require('../src');
let c = new Container();
const { Page, Reaction } = c._componentClasses;
const { expect } = require('chai');

describe('Test for requirements', () => {
  it('Check Page requirements', () => {
    expect(Page.requirements())
      .to.be.deep.equal({});  
  });
  it('Check Page requirements', () => {
    expect(Reaction.requirements())
      .to.have.all.keys('actors', 'compartment', 'modifiers');  
  });
});
