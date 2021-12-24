/* global describe, it */
const { expect } = require('chai');
const { Container } = require('../../src');

const qArr = [
  {action: 'defineUnit', id: 'mM', units: [{kind: 'mole', multiplier: 1e-3}, {kind: 'litre', exponent: -1}]},
  {action: 'defineUnit', id: 'UL', units: [{kind: 'dimensionless'}]},
  {action: 'insert', class: 'Const', id: 'c1', num: 1, units: 'mM^2'},
  {action: 'insert', class: 'Const', id: 'c2', num: 1, units: 'mM^2'},
  {action: 'insert', class: 'Const', id: 'c3', num: 1, units: '(1e-3 mole)^2/litre^2'},
  {action: 'insert', class: 'Const', id: 'k1', num: 1, units: [{kind: 'dimensionless'}]},
  {action: 'insert', class: 'Const', id: 'k2', num: 1, units: 'dimensionless'},
  {action: 'insert', class: 'Const', id: 'k3', num: 1, units: 'UL'},
  {action: 'insert', class: 'Const', id: 'k4', num: 1, units: []}
];

describe('Check Unit.equal(...)', () => {
  let p;

  it('Create platform', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    //console.log(p.defaultLogs);
    expect(p.logger).to.have.property('hasErrors').false;
  });

  // simple units 

  it('Equal no rebase', () => {
    let c1 = p.namespaceStorage.get('nameless').get('c1');
    let c2 = p.namespaceStorage.get('nameless').get('c2');
    let isEqual = c1.unitsParsed.equal(c2.unitsParsed, false);
    expect(isEqual).to.be.true;
  });

  it('Not equal no rebase', () => {
    let c1 = p.namespaceStorage.get('nameless').get('c1');
    let c3 = p.namespaceStorage.get('nameless').get('c3');
    let isEqual = c1.unitsParsed.equal(c3.unitsParsed, false);
    expect(isEqual).to.be.false;
  });

  it('Equal rebase', () => {
    let c1 = p.namespaceStorage.get('nameless').get('c1');
    let c2 = p.namespaceStorage.get('nameless').get('c2');
    let isEqual = c1.unitsParsed.equal(c2.unitsParsed, true);
    expect(isEqual).to.be.true;
  });

  it('Equal rebase 2', () => {
    let c1 = p.namespaceStorage.get('nameless').get('c1');
    let c3 = p.namespaceStorage.get('nameless').get('c3');
    let isEqual = c1.unitsParsed.equal(c3.unitsParsed, true);
    expect(isEqual).to.be.true;
  });

  // dimensionless units

  it('dimensionless equal no rebase', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k2 = p.namespaceStorage.get('nameless').get('k2');
    let isEqual = k1.unitsParsed.equal(k2.unitsParsed, false);
    expect(isEqual).to.be.true;
  });

  it('dimensionless not equal no rebase', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k3 = p.namespaceStorage.get('nameless').get('k3');
    let isEqual = k1.unitsParsed.equal(k3.unitsParsed, false);
    expect(isEqual).to.be.false;
  });

  it('dimensionless not equal no rebase 2', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k4 = p.namespaceStorage.get('nameless').get('k4');
    let isEqual = k1.unitsParsed.equal(k4.unitsParsed, false);
    expect(isEqual).to.be.true;
  });
  
  it('dimensionless equal rebase', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k2 = p.namespaceStorage.get('nameless').get('k2');
    let isEqual = k1.unitsParsed.equal(k2.unitsParsed, true);
    expect(isEqual).to.be.true;
  });

  it('dimensionless equal rebase 2', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k3 = p.namespaceStorage.get('nameless').get('k3');
    let isEqual = k1.unitsParsed.equal(k3.unitsParsed, true);
    expect(isEqual).to.be.true;
  });

  it('dimensionless equal rebase 3', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    let k4 = p.namespaceStorage.get('nameless').get('k4');
    let isEqual = k1.unitsParsed.equal(k4.unitsParsed, true);
    expect(isEqual).to.be.true;
  });

});
