/* global describe, it */
// checking conversion to core units
const { expect } = require('chai');
const { Container } = require('../../src');

const qArr = [
  {action: 'defineUnit', id: 'mM', units: [{kind: 'mole', multiplier: 1e-3}, {kind: 'litre', exponent: -1}]},
  {action: 'insert', class: 'Const', id: 'xxx', num: 1, units: 'mM^2'},
  {action: 'insert', class: 'Const', id: 'k1', num: 1, units: [{kind: 'dimensionless'}]},
  {action: 'insert', class: 'Const', id: 'k2', num: 1, units: [{kind: 'UL'}]},
  {action: 'insert', class: 'Const', id: 'k3', num: 1, units: []},
  {action: 'defineUnit', id: 'UL', units: [{kind: 'dimensionless'}]},
  {action: 'defineUnit', id: 'percent', units: [{kind: 'dimensionless', multiplier: 1e-2}]},
  {action: 'insert', class: 'Const', id: 'k4', num: 2, units: 'percent'},
  {action: 'insert', class: 'Const', id: 'volume', num: 1, units: 'litre'},
  {action: 'insert', class: 'Const', id: 'millilitre', num: 1, units: '(1e-3 litre)'},
  {action: 'insert', class: 'Const', id: 'inverseVolume', num: 1, units: '1/litre'},
  {action: 'insert', class: 'Const', id: 'cubicMetre', num: 1, units: 'metre^3'},
  {action: 'insert', class: 'Const', id: 'litreInMetres', num: 1, units: '(1e-1 metre)^3'}
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
    let volume = p.namespaceStorage.get('nameless').get('volume');
    let metreVolume = p.namespaceStorage.get('nameless').get('litreInMetres');
    let cubicMetre = p.namespaceStorage.get('nameless').get('cubicMetre');
    let rebased = volume.unitsParsed.rebaseToPrimitive();
    expect(rebased.toQ()).to.deep.equal([{kind: 'metre', multiplier: 0.1, exponent: 3}]);
    expect(volume.unitsParsed.equal(metreVolume.unitsParsed, true)).to.be.true;
    expect(volume.unitsParsed.equal(cubicMetre.unitsParsed, true)).to.be.false;
    expect(volume.unitsParsed.toTerm().simplify().toString()).to.equal('length^3');
    expect(volume.unitsParsed.rebase(['litre']).toString()).to.equal('litre');
  });

  it('calculates the litre to cubic metre ratio', () => {
    let volume = p.namespaceStorage.get('nameless').get('volume');
    let cubicMetre = p.namespaceStorage.get('nameless').get('cubicMetre');
    let ratio = volume.unitsParsed.divide(cubicMetre.unitsParsed).rebaseToPrimitive().simplify();
    expect(ratio).to.have.lengthOf(1);
    expect(ratio[0].kind).to.equal('dimensionless');
    expect(ratio[0].multiplier).to.be.closeTo(1e-3, 1e-12);
  });

  it('scaled and inverse litre to primitive', () => {
    let millilitre = p.namespaceStorage.get('nameless').get('millilitre');
    let inverseVolume = p.namespaceStorage.get('nameless').get('inverseVolume');
    let scaled = millilitre.unitsParsed.rebaseToPrimitive();
    let inverse = inverseVolume.unitsParsed.rebaseToPrimitive();
    expect(scaled[0].kind).to.equal('metre');
    expect(scaled[0].exponent).to.equal(3);
    expect(scaled[0].multiplier ** scaled[0].exponent).to.be.closeTo(1e-6, 1e-15);
    expect(inverse.toQ()).to.deep.equal([{kind: 'metre', multiplier: 0.1, exponent: -3}]);
  });

  it('mM to primitive', () => {
    let mM = p.unitDefStorage.get('mM');
    expect(mM.units).to.be.equal('(1e-3 mole)/litre');
    let rebased = mM.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('(1e-3 mole)/(1e-1 metre)^3');
  });

  it('uM2 to primitive', () => {
    let xxx = p.namespaceStorage.get('nameless').get('xxx');
    expect(xxx.units).to.be.equal('mM^2');
    let rebased = xxx.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('(1e-3 mole)^2/(1e-1 metre)^6');
  });
  
  it('dimensionless to primitive', () => {
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

  it('percent to primitive', () => {
    let k4 = p.namespaceStorage.get('nameless').get('k4');
    expect(k4.units).to.be.equal('percent');
    let rebased = k4.unitsParsed.rebaseToPrimitive();
    expect(rebased.toString()).to.be.equal('(1e-2 dimensionless)');
  });
});
