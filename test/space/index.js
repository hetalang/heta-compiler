/* global describe, it */

const { expect } = require('chai');
const { Container } = require('../../src');

describe('Testing anonimous space.', () => {
  it('Create element in global.', () => {
    let c = new Container;

    c.loadMany([
      {
        id: 'k1',
        class: 'Const',
        num: 1
      },
      {
        id: 'p1',
        class: 'Record',
        assignments: {
          start_: 'k1'
        }
      },
      {
        action: 'setNS',
        space: 'one'
      },
      {
        action: 'importNS',
        fromSpace: 'nameless',
        space: 'one'
      },
      {
        action: 'export',
        space: 'one',
        format: 'JSON'
      },
      {
        id: 'p1',
        space: 'one',
        class: 'Record',
        assignments: {
          start_: 0
        }
      },
      {
        id: 'p2',
        space: 'one',
        class: 'Record',
        assignments: {
          start_: 'k1'
        }
      }
    ]);
    
    expect(c).to.have.property('length', 5);
  });
});
