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
  it('allows clearing Const.num until a concrete namespace is knit', () => {
    let abstractContainer = new Container();
    abstractContainer.setNS({space: 'abstract', type: 'abstract'});
    abstractContainer.load({class: 'Const', id: 'k', space: 'abstract', num: 1});
    abstractContainer.load({class: 'Const', id: 'k', space: 'abstract', num: null});
    abstractContainer.knitMany();

    expect(abstractContainer.logger.hasErrors).to.equal(false);
    expect(abstractContainer.namespaceStorage.get('abstract').get('k').num).to.equal(undefined);

    let concreteContainer = new Container();
    concreteContainer.load({class: 'Const', id: 'k', num: null});
    concreteContainer.knitMany();

    expect(concreteContainer.logger.hasErrors).to.equal(true);
  });
  it('requires an active value after a switcher clears it', () => {
    let container = new Container();
    container.load({class: 'DSwitcher', id: 'sw', trigger: 't > 1', active: null});
    container.knitMany();

    expect(container.logger.hasErrors).to.equal(true);
    let switcher = container.namespaceStorage.get('nameless').get('sw');
    expect(switcher.clone().active).to.equal(undefined);
    expect(switcher.toQ()).to.have.property('active', null);
  });
});
