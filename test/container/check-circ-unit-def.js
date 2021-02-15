/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

let correct = [
  {action: 'defineUnit', id: 'a', units: 'mole/litre'},
  {action: 'defineUnit', id: 'b', units: 'a2'}
];

describe('Test circularity for UnitDef', () => {
  it('No circ', () => {
    const p = new Container();
    p.loadMany(correct);
    p.checkCircUnitDef();
    expect(p.logger).to.have.property('hasErrors').false;
  });
});

let incorrect = [
  {action: 'defineUnit', id: 'a', units: 'b'},
  {action: 'defineUnit', id: 'b', units: 'c'},
  {action: 'defineUnit', id: 'c', units: 'a'}
];

describe('Test circularity for UnitDef', () => {
  it('Circ exists', () => {
    const p = new Container();
    p.loadMany(incorrect);
    p.checkCircUnitDef();
    expect(p.logger).to.have.property('hasErrors').true;
  });
});
