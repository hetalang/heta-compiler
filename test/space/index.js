/* global describe, it */

const { expect } = require('chai');
const { Container } = require('../../src');

describe('Testing anonimous space.', () => {
  it('Create element in global.', () => {
    let c = new Container;
    let counter = c.length;

    c.loadMany([
      {
        id: 'k1', // 1
        class: 'Const',
        num: 1
      },
      {
        id: 'p1', // 2
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
        action: 'importNS', // 4
        fromSpace: 'nameless',
        space: 'one'
      },
      {
        action: 'export', // 5
        space: 'one',
        format: 'JSON'
      },
      {
        id: 'p1', // 5
        space: 'one',
        class: 'Record',
        assignments: {
          start_: 0
        }
      },
      {
        id: 'p2', // 6
        space: 'one',
        class: 'Record',
        assignments: {
          start_: 'k1'
        }
      }
    ]);
    
    expect(c.length - counter).to.be.eq(6);
  });
});
