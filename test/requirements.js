/* global describe, it */
const { Container } = require('../src');
let c = new Container();
const { Page, Reaction } = c.classes;
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
  it('checks TimeScale fields only in concrete namespaces', () => {
    let abstractContainer = new Container();
    abstractContainer.setNS({space: 'abstract', type: 'abstract'});
    abstractContainer.load({class: 'TimeScale', id: 'abstractTime', space: 'abstract'});
    abstractContainer.knitMany();

    expect(abstractContainer.logger.hasErrors).to.equal(false);

    let concreteContainer = new Container();
    concreteContainer.load({class: 'TimeScale', id: 'concreteTime'});
    concreteContainer.knitMany();

    expect(concreteContainer.logger.hasErrors).to.equal(true);
  });
});
