/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr = [
  {action: 'defineUnit', id: 'xxx', units: 'item^2/litre'},
  {action: 'defineUnit', id: 'yyy', units: 'xxx/item'},
  {action: 'defineUnit', id: 'zzz', units: 'xxx/kilogram'},
  {action: 'defineUnit', id: 'ooo', units: 'xxx/wrong'},
  {action: 'defineUnit', id: 'www', units: 'litre/ooo'},
  {action: 'defineUnit', id: 'ng', units: [{kind: 'gram', multiplier: 1e-9}]},
  {action: 'defineUnit', id: 'ttt1', units: 'ng'}
];

describe('Testing creation of UnitTerm from Unit', () => {
  let p;

  it('Create and knit', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    //expect(p.logger).to.have.property('hasErrors').false;
  });

  it('Check xxx UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('xxx');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.deep.equal([
      {kind: 'amount', exponent: 2},
      {kind: 'length', exponent: -3}
    ]);
  });

  it('Check yyy UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('yyy');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.deep.equal([
      {kind: 'amount', exponent: 2},
      {kind: 'length', exponent: -3},
      {kind: 'amount', exponent: -1}
    ]);
  });

  it('Check zzz UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('zzz');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.deep.equal([
      {kind: 'amount', exponent: 2},
      {kind: 'length', exponent: -3},
      {kind: 'mass', exponent: -1}
    ]);
  });
  
  it('Check ooo UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('ooo');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.undefined;
  });

  it('Check www UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('www');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.undefined;
  });
  
  it('Check ttt1 UnitDefinition', () => {
    let ud0 = p.unitDefStorage.get('ttt1');
    let ut0 = ud0.unitsParsed.toTerm();
    expect(ut0).to.be.deep.equal([
      {kind: 'mass', exponent: 1}
    ]);
  });
});
