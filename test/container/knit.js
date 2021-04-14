/* global describe, it */

const { Container } = require('../../src');

const { expect } = require('chai');

describe('Test All()', () => {
  let c; // for Container
  let counter = 0;

  it('Creating good platform.', () => {
    c = new Container();
    counter = c.length;
    c.setNS({space: 'one'});
    c.loadMany([
      {class: 'Const', id: 'k1', num: 1}, // 1
      {class: 'Const', id: 'k2', num: 2}, // 1 + 1
      {action: 'importNS', space: 'one', fromSpace: 'nameless'},
      {class: 'Const', id: 'k1', space: 'one', num: 1.1}, // 1 first space call

      {class: 'Record', id: 'p1', assignments: {start_: 'k1'}}, // 1 
      {class: 'Record', id: 'p1', space: 'one', assignments: {start_: 'k1'}}, // 1
      {class: 'Record', id: 'p2', space: 'one', assignments: {start_: 'k2'}}, // 1

      {class: 'Record', id: 'p3', space: 'one', assignments: {start_: 'p2'}}, // 1
      {class: 'Record', id: 'p4', assignments: {start_: 'p1'}}, // 1 + 0

      {class: 'Compartment', id: 'comp1', assignments: { start_: 1 } }, // 1
      {class: 'Compartment', id: 'comp2', assignments: { start_: 1 } }, // 1 + 0
      {class: 'Compartment', id: 'comp1', space: 'one', assignments: { start_: 1 }}, // 1

      {class: 'Species', id: 's1', compartment: 'comp1', assignments: { start_: 0 }}, // 1
      {class: 'Species', id: 's1', space: 'one', compartment: 'comp1', assignments: { start_: 0 }}, // 1
      {class: 'Species', id: 's2', space: 'one', compartment: 'comp1', assignments: { start_: 0 }} // 1
    ]);
    
    expect(c.length - counter).to.be.eq(15 + 1); // t @TimeScale creates automatically
  });

  it('knitMany good platform.', () => {
    c.knitMany();
    expect(c.length - counter).to.be.eq(15 + 1); // t @TimeScale creates automatically
  });
});
