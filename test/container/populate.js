/* global describe, it */

const { Container } = require('../../src');
const XArray = require('../../src/x-array');

const { expect } = require('chai');

describe('Test populate()', () => {
  let c; // for Container

  it('Creating good platform.', () => {
    c = new Container();
    c.loadMany([
      {class: 'Const', id: 'k1', num: 1}, // glob
      {class: 'Const', id: 'k2', num: 2}, // glob + virtual local
      {class: 'Const', id: 'k1', space: 'one', num: 1.1},

      {class: 'Record', id: 'p1', assignments: {start_: 'k1'}}, // glob
      {class: 'Record', id: 'p1', space: 'one', assignments: {start_: 'k1'}},
      {class: 'Record', id: 'p2', space: 'one', assignments: {start_: 'k2'}},

      {class: 'Record', id: 'p3', space: 'one', assignments: {start_: 'p4'}},
      {class: 'Record', id: 'p4', assignments: {start_: 'p1'}}, // glob + local

      {class: 'Compartment', id: 'comp1'}, // glob
      {class: 'Compartment', id: 'comp2'}, // glob + virtual local
      {class: 'Compartment', id: 'comp1', space: 'one'},

      {class: 'Species', id: 's1', compartment: 'comp1'}, // glob
      {class: 'Species', id: 's1', space: 'one', compartment: 'comp1'},
      {class: 'Species', id: 's2', space: 'one', compartment: 'comp2'}
    ]);
    //console.log(c.storage);
    expect(c).to.have.property('length', 14);
  });

  it('Populate good platform.', () => {
    c.populate();
    expect(c).to.have.property('length', 17);
  });

  it('Get components visible for "one" namespace', () => {
    let one = c.getPopulation('one');
    expect(one).to.be.instanceOf(XArray);
    expect(one).to.have.property('length', 10);
  });

  it('Get components visible for "anonimous" namespace', () => {
    let one = c.getPopulation();
    expect(one).to.be.instanceOf(XArray);
    expect(one).to.have.property('length', 7);
  });
});
