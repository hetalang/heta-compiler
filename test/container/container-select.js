/* global describe, it */
const { Container } = require('../../src');
const { expect } = require('chai');

describe('Test select()', () => {
  let c;

  it('Create container', () => {
    c = new Container();
    c.loadMany([
      {
        action: 'setNS',
        space: 'one'
      },
      {
        class: 'Species',
        id: 'sp1',
        space: 'one'
      },
      {
        class: 'Species',
        id: 'sp2',
        space: 'one'
      },
      {
        class: 'Const',
        id: 'sp1'
      },
      {
        class: 'Const',
        id: 'sp3'
      }
    ]);
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
});