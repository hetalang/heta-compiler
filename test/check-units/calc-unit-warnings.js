/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr = [
  {action: 'defineUnit', id: 'mM', units: '(1e-3 mole)/litre'},
  {id: 'k1', class: 'Const', units: '1', num: 1e-3},
  {id: 'k2', class: 'Const', units: 'mM', num: 1.5},
  {id: 'k3', class: 'Const', units: '(1e-3 mole)/litre', num: 1.5},
  {id: 'k4', class: 'Const', units: 'mole/litre', num: 1.5},
  {id: 'k5', class: 'Const', num: 2.2},
  // operators
  {id: 'x1a', class: 'Record', units: 'mM', assignments: {start_: 'k3+k2-k4'}},
  {id: 'x1b', class: 'Record', units: 'mM', assignments: {start_: 'k3+k2-k5'}},
  {id: 'x1c', class: 'Record', units: 'mM', assignments: {start_: 'k3*k5'}},
  {id: 'x1d', class: 'Record', units: 'mM', assignments: {start_: 'k3 + 1.2'}},
  {id: 'x1e', class: 'Record', units: 'mM', assignments: {start_: 'k5/k3'}},
  {id: 'x2a', class: 'Record', assignments: {start_: 'k3^k1'}},
  {id: 'x2b', class: 'Record', assignments: {start_: 'k1^k3'}},
  {id: 'x4', class: 'Record', units: 'mM', assignments: {start_: '15*k2'}}, // not checked
  {id: 'x5', class: 'Record', assignments: {start_: 'k3/k4 + 1.2'}},
  {action: 'insert', id: 'sw3', class: 'DSwitcher', trigger: '(k2>1) and (k2<=k4)'},
  // functions
  {id: 'y1a', class: 'Record', assignments: {start_: 'add(k3, subtract(k2, k4))'}},
  {id: 'y1b', class: 'Record', assignments: {start_: 'add(k3, subtract(k2, k5))'}},
  {id: 'y1c', class: 'Record', assignments: {start_: 'multiply(k3, k5)'}},
  {id: 'y1d', class: 'Record', assignments: {start_: 'add(k3, 1.2)'}},
  {id: 'y1e', class: 'Record', assignments: {start_: 'divide(k5, k3)'}},
  {id: 'y2a', class: 'Record', assignments: {start_: 'pow(k3, k1)'}},
  {id: 'y2b', class: 'Record', assignments: {start_: 'pow(k1, k3)'}},
  {id: 'y4', class: 'Record', assignments: {start_: 'abs(k2) + ceil(k5) + floor(k5)'}},
  {id: 'y5', class: 'Record', assignments: {start_: 'max(k2, x4, k1) + min(k2, x4, 1)'}},
  {id: 'y6', class: 'Record', assignments: {start_: 'square(k2+k1)*cube(x4)*sqrt(x1a)'}},
  {id: 'y7', class: 'Record', assignments: {start_: 'nthRoot(4,x4)'}},
  {id: 'y8', class: 'Record', assignments: {start_: 'log(2,k2)'}},
  {id: 'y9', class: 'Record', assignments: {start_: 'sign(k3 + 1.1)'}},
  {id: 'y10', class: 'Record', assignments: {start_: 'ifge(k1,k2,k3,k4)'}}
];

describe('Testing warnings of checkUnits()', () => {
  let p;

  it('Create and knit', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    expect(p.logger).to.have.property('hasErrors').false;
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: mM + mM - M', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1a');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // (1e-3 mole)/litre vs mole/litre
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: mM + mM - undefined', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1b');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: mM + mM - undefined', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1b');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: mM * undefined', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1c');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: mM + 1', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1d');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // (1e-3 mole)/litre vs 1
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: undefined/mM', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1e');
    let expr = x1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });
  
  it('operators: k3^k1', () => {
    let x2 = p.namespaceStorage.get('nameless').get('x2a');
    let expr = x2.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x2);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // second argument should be a number
    p.defaultLogs.length = 0; // RESET
  });

  it('operators: k1^k3', () => {
    let x2 = p.namespaceStorage.get('nameless').get('x2b');
    let expr = x2.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x2);
    expect(unit.toString()).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(1); // power arguments must be dimensionless
    p.defaultLogs.length = 0; // RESET
  });

  it('not standard dimensionless', () => {
    let x5 = p.namespaceStorage.get('nameless').get('x5');
    let expr = x5.assignments.start_.exprParsed;
    let unit = expr.calcUnit(x5);
    expect(unit.simplify().toString()).to.be.equal('(1e-3 dimensionless)');
    expect(p.defaultLogs).to.be.lengthOf(1);
    p.defaultLogs.length = 0; // RESET
  });

  it('constants: > < >= <= == !=', () => {
    let sw3 = p.namespaceStorage.get('nameless').get('sw3');
    let expr = sw3.trigger.exprParsed;
    let unit = expr.calcUnit(sw3);
    expect(unit.toString()).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(2); // inconsistency "mM vs 1" "mM vs mole/litre"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: mM + (mM - M)', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1a');
    let expr = y1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y1);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // mM vs mole/litre
    p.defaultLogs.length = 0; // RESET
  });
  
  it('functions: mM + (mM - undefined)', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1b');
    let expr = y1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: mM * undefined', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1c');
    let expr = y1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: mM + 1', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1d');
    let expr = y1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y1);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // (1e-3 mole)/litre vs 1
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: undefined/mM', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1e');
    let expr = y1.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y1);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(1); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });
  
  it('functions: pow(k3,k1)', () => {
    let y2 = p.namespaceStorage.get('nameless').get('y2a');
    let expr = y2.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y2);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(1); // second argument should be a number
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: pow(k1,k3)', () => {
    let y2 = p.namespaceStorage.get('nameless').get('y2b');
    let expr = y2.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y2);
    expect(unit.toString()).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(1); // power arguments must be dimensionless
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: abs ceil floor', () => {
    let y4 = p.namespaceStorage.get('nameless').get('y4');
    let expr = y4.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y4);
    expect(unit).to.be.undefined;
    expect(p.defaultLogs).to.be.lengthOf(2); // no units found for "k5"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: max min', () => {
    let y5 = p.namespaceStorage.get('nameless').get('y5');
    let expr = y5.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y5);
    expect(unit.toString()).to.be.equal('mM');
    expect(p.defaultLogs).to.be.lengthOf(2); // "mM vs mM vs 1", "mM vs mM vs 1"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: square cube sqrt', () => {
    let y6 = p.namespaceStorage.get('nameless').get('y6');
    let expr = y6.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y6);
    expect(unit.toString()).to.be.equal('mM^2*mM^3*mM^0.5');
    expect(p.defaultLogs).to.be.lengthOf(1); // "mM vs 1"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: nthRoot', () => {
    let y7 = p.namespaceStorage.get('nameless').get('y7');
    let expr = y7.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y7);
    expect(unit.toString()).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(1); // arguments must be dimensionless
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: log', () => {
    let y8 = p.namespaceStorage.get('nameless').get('y8');
    let expr = y8.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y8);
    expect(unit.toString()).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(1); //second arguments of log() must be dimensionless
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: sign', () => {
    let y9 = p.namespaceStorage.get('nameless').get('y9');
    let expr = y9.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y9).toString();
    expect(unit).to.be.equal('dimensionless');
    expect(p.defaultLogs).to.be.lengthOf(1); // "(1e-3 mole)/litre vs 1"
    p.defaultLogs.length = 0; // RESET
  });

  it('functions: ifgt etc', () => {
    let y10 = p.namespaceStorage.get('nameless').get('y10');
    let expr = y10.assignments.start_.exprParsed;
    let unit = expr.calcUnit(y10);
    expect(unit.toString()).to.be.equal('(1e-3 mole)/litre');
    expect(p.defaultLogs).to.be.lengthOf(2); // "1 vs mM" "(1e-3 mole)/litre vs mole/litre"
    p.defaultLogs.length = 0; // RESET
  });
  
  it('temp', () => {
    //console.log(p.defaultLogs);
  });
});
