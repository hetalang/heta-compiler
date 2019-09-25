/* global describe, it */
const { Container } = require('../src');
// const { Page } = c.classes;
const { expect } = require('chai');

describe('Test select() and softSelect()', () => {
  let c = new Container();
  c.load({
    class: 'Species',
    id: 'sp1',
    space: 'one'
  });
  c.load({
    class: 'Species',
    id: 'sp2',
    space: 'one'
  });
  c.load({
    class: 'Const',
    id: 'sp1'
  });
  c.load({
    class: 'Const',
    id: 'sp3'
  });
  it('Check select() for existed local.', () => {
    let sp1 = c.select({id: 'sp1', space: 'one'});
    expect(sp1).to.have.property('className', 'Species');
  });
  it('Check select() for existed global.', () => {
    let sp1 = c.select({id: 'sp1'});
    expect(sp1).to.have.property('className', 'Const');
  });
  it('Check select() for not existed local.', () => {
    let sp1 = c.select({id: 'sp3', space: 'one'});
    expect(sp1).to.be.undefined;
  });
  it('Check select() for not existed global.', () => {
    let sp1 = c.select({id: 'sp2'});
    expect(sp1).to.be.undefined;
  });

  it('Check softSelect() for existed local.', () => {
    let sp1 = c.softSelect({id: 'sp1', space: 'one'});
    expect(sp1).to.have.property('className', 'Species');
  });
  it('Check softSelect() for existed global.', () => {
    let sp1 = c.softSelect({id: 'sp1'});
    expect(sp1).to.have.property('className', 'Const');
  });
  it('Check softSelect() for not existed local.', () => {
    let sp1 = c.softSelect({id: 'sp3', space: 'one'});
    expect(sp1).to.have.property('className', 'Const');
  });
  it('Check softSelect() for not existed global.', () => {
    let sp1 = c.softSelect({id: 'sp2'});
    expect(sp1).to.be.undefined;
  });
});