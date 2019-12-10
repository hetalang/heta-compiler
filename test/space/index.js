/* global describe, it */

const { expect } = require('chai');

const { Container } = require('../../src');

describe('Testing anonimous space.', () => {
  it('Create element in global.', () => {
    let c = new Container;

    c.load({
      id: 'k1',
      class: 'Const',
      num: 1
    });
    c.load({
      id: 'p1',
      class: 'Record',
      assignments: {
        start_: 'k1'
      }
    });
    let json1 = c.load({
      id: 'json1',
      space: 'one',
      class: 'JSONExport'
    });
    c.load({
      id: 'p1',
      space: 'one',
      class: 'Record',
      assignments: {
        start_: 0
      }
    });
    c.load({
      id: 'p2',
      space: 'one',
      class: 'Record',
      assignments: {
        start_: 'k1'
      }
    });
    
    expect(c).to.have.property('length', 6);
    json1.make();
  });
});
