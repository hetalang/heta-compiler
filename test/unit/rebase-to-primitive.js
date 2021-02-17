/* global describe, it */
const { expect } = require('chai');
const { Container } = require('../../src');

const qArr = [
  {action: 'defineUnit', id: 'mM', units: [{kind: 'mole', multiplier: 1e-3}, {kind: 'litre', exponent: -1}]},
  {action: 'insert', class: 'Const', id: 'xxx', num: 1, units: 'mM2'},
  {action: 'insert', class: 'Const', id: 'k1', num: 1, units: [{kind: 'dimensionless'}]},
  {action: 'insert', class: 'Const', id: 'k2', num: 1, units: [{kind: 'UL'}]},
  {action: 'insert', class: 'Const', id: 'k3', num: 1, units: []},
  {action: 'defineUnit', id: 'UL', units: [{kind: 'dimensionless'}]}
];

describe('Check Unit.rebaseToPrimitive()', () => {
  let p;

  it('Create platform', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    //console.log(p.defaultLogs);
    expect(p.logger).to.have.property('hasErrors').false;
  });

  it('litre to primitive', () => {
    let litre = p.unitDefStorage.get('litre');
    expect(litre.units).to.be.undefined;
  });

  it('mM to primitive', () => {
    let mM = p.unitDefStorage.get('mM');
    expect(mM.units).to.be.equal('(1e-3 mole)/litre');
    let rebased = mM.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('(1e-3 mole)/litre');
  });

  it('uM2 to primitive', () => {
    let xxx = p.namespaceStorage.get('nameless').get('xxx');
    expect(xxx.units).to.be.equal('mM^2');
    let rebased = xxx.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('(1e-3 mole)^2/litre^2');
  });
  
  it('dimentionless to primitive', () => {
    let k1 = p.namespaceStorage.get('nameless').get('k1');
    expect(k1.units).to.be.equal('dimensionless');
    let rebased = k1.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('dimensionless');
  });
  
  it('UL to primitive', () => {
    let k2 = p.namespaceStorage.get('nameless').get('k2');
    expect(k2.units).to.be.equal('UL');
    let rebased = k2.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('dimensionless');
  });
  
  it('[] to primitive', () => {
    let k3 = p.namespaceStorage.get('nameless').get('k3');
    expect(k3.units).to.be.equal('dimensionless');
    let rebased = k3.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('dimensionless');
  });
});
