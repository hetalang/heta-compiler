/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr = [
  {action: 'defineUnit', id: 'mM', units: '(1e-3 mole)/litre'},
  {id: 'k1', class: 'Const', units: '1', num: 1e-3},
  {id: 'k2', class: 'Const', units: 'mM', num: 1.5},
  {id: 'k3', class: 'Const', units: '(1e-3 mole)/litre', num: 1.5},
  {id: 'k4', class: 'Const', units: 'mole/litre', num: 1.5},
  // operators
  {id: 'x1', class: 'Record', units: 'mM', assignments: {start_: 'k1*k3/k1+k2-k2'}},
  {id: 'x2', class: 'Record', assignments: {start_: 'k3^1.2'}},
  {id: 'x3', class: 'Record', assignments: {start_: 15}},
  {id: 'x4', class: 'Record', units: 'mM', assignments: {start_: '15*k2'}},
  {id: 'x5', class: 'Record', assignments: {start_: 'k3/k4'}},
  {action: 'insert', id: 'sw1', class: 'DSwitcher', trigger: '(true and false) or (not true)'},
  {action: 'insert', id: 'sw2', class: 'DSwitcher', trigger: 'true'},
  {action: 'insert', id: 'sw3', class: 'DSwitcher', trigger: '(k1>1) and (k2<=x4) and (k3!=k2) and (k3==k2)'},
  // functions
  {id: 'y1', class: 'Record', assignments: {start_: 'add(multiply(k1, divide(k3, k1)), subtract(k2, k2))'}},
  {id: 'y2', class: 'Record', assignments: {start_: 'pow(k3, 1.2)'}},
  {id: 'y3', class: 'Record', assignments: {start_: 'pow(1.2, k1)'}},
  {id: 'y4', class: 'Record', assignments: {start_: 'abs(k2) + ceil(k2) + floor(k2)'}},
  {id: 'y5', class: 'Record', assignments: {start_: 'max(k2, x4, x1) + min(k2, x4, x1)'}},
  {id: 'y6', class: 'Record', assignments: {start_: 'square(k2)*cube(x4)*sqrt(x1)'}},
  {id: 'y7', class: 'Record', assignments: {start_: 'nthRoot(k2)*nthRoot(x4,4)*nthRoot(12,k1)'}},
  {id: 'y8', class: 'Record', assignments: {start_: 'log(k1) + log(k2,2) + log2(k3) + log10(k4) + ln(x1)'}},
  {id: 'y9', class: 'Record', assignments: {start_: 'sign(k3)'}},
  {id: 'y10', class: 'Record', assignments: {start_: 'ifge(x1,k2,k3,k2)'}},
  // ternary operator,
  {id: 'y11', class: 'Record', assignments: {start_: 'x1>=k2 ? k3 : k2'}},
  // piecewise function
  {id: 'y12', class: 'Record', assignments: {start_: 'piecewise(k3, x1 >= k2, k2)'}},
  {id: 'y13', class: 'Record', assignments: {start_: 'piecewise(k3, x1 >= k2)'}},
  {id: 'y14', class: 'Record', assignments: {start_: 'piecewise(1, x1 >= k2, 2, x1 >= 2*k2, 0)'}},
];

describe('Testing checkUnits() for components', () => {
  let p;

  it('Create and knit', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    expect(p.logger).to.have.property('hasErrors').false;
  });

  it('operators: + - * /', () => {
    let x1 = p.namespaceStorage.get('nameless').get('x1');
    let expr = x1.assignments.start_;
    let unit = expr.calcUnit(x1).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });

  it('operators: ^', () => {
    let x2 = p.namespaceStorage.get('nameless').get('x2');
    let expr = x2.assignments.start_;
    let unit = expr.calcUnit(x2).toString();
    expect(unit).to.be.equal('(1e-3 mole)^1.2/litre^1.2');
  });

  it('single number', () => {
    let x2 = p.namespaceStorage.get('nameless').get('x3');
    let expr = x2.assignments.start_;
    let unit = expr.calcUnit(x2).toString();
    expect(unit).to.be.equal('dimensionless');
  });
  
  it('number in expression: 15*k2', () => {
    let x4 = p.namespaceStorage.get('nameless').get('x4');
    let expr = x4.assignments.start_;
    let unit = expr.calcUnit(x4).toString();
    expect(unit).to.be.equal('mM');
  });

  it('not standard dimensionless', () => {
    let x5 = p.namespaceStorage.get('nameless').get('x5');
    let expr = x5.assignments.start_;
    let unit = expr.calcUnit(x5).simplify().toString();
    expect(unit).to.be.equal('(1e-3 dimensionless)');
  });

  it('operators: and or xor not', () => {
    let sw1 = p.namespaceStorage.get('nameless').get('sw1');
    let expr = sw1.trigger;
    let unit = expr.calcUnit(sw1).toString();
    expect(unit).to.be.equal('dimensionless');
  });

  it('constants: true false', () => {
    let sw2 = p.namespaceStorage.get('nameless').get('sw2');
    let expr = sw2.trigger;
    let unit = expr.calcUnit(sw2).toString();
    expect(unit).to.be.equal('dimensionless');
  });
  
  it('constants: > < >= <= == !=', () => {
    let sw3 = p.namespaceStorage.get('nameless').get('sw3');
    let expr = sw3.trigger;
    let unit = expr.calcUnit(sw3).toString();
    expect(unit).to.be.equal('dimensionless');
  });
  
  it('functions: add, substract, multiply, divide', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1');
    let expr = y1.assignments.start_;
    let unit = expr.calcUnit(y1).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });
  
  it('functions: pow(mM,1)', () => {
    let y2 = p.namespaceStorage.get('nameless').get('y2');
    let expr = y2.assignments.start_;
    let unit = expr.calcUnit(y2).toString();
    expect(unit).to.be.equal('(1e-3 mole)^1.2/litre^1.2');
  });

  it('functions: pow(1,k1)', () => {
    let y3 = p.namespaceStorage.get('nameless').get('y3');
    let expr = y3.assignments.start_;
    let unit = expr.calcUnit(y3).toString();
    expect(unit).to.be.equal('dimensionless');
  });

  it('functions: abs ceil floor', () => {
    let y4 = p.namespaceStorage.get('nameless').get('y4');
    let expr = y4.assignments.start_;
    let unit = expr.calcUnit(y4).toString();
    expect(unit).to.be.equal('mM');
  });

  it('functions: max min', () => {
    let y5 = p.namespaceStorage.get('nameless').get('y5');
    let expr = y5.assignments.start_;
    let unit = expr.calcUnit(y5).toString();
    expect(unit).to.be.equal('mM');
  });

  it('functions: square cube sqrt', () => {
    let y6 = p.namespaceStorage.get('nameless').get('y6');
    let expr = y6.assignments.start_;
    let unit = expr.calcUnit(y6).toString();
    expect(unit).to.be.equal('mM^2*mM^3*mM^0.5');
  });

  it('functions: nthRoot', () => {
    let y7 = p.namespaceStorage.get('nameless').get('y7');
    let expr = y7.assignments.start_;
    let unit = expr.calcUnit(y7).toString();
    expect(unit).to.be.equal('mM^0.5*mM^0.25');
  });

  it('functions: log', () => {
    let y8 = p.namespaceStorage.get('nameless').get('y8');
    let expr = y8.assignments.start_;
    let unit = expr.calcUnit(y8).toString();
    expect(unit).to.be.equal('dimensionless');
  });

  it('functions: sign', () => {
    let y9 = p.namespaceStorage.get('nameless').get('y9');
    let expr = y9.assignments.start_;
    let unit = expr.calcUnit(y9).toString();
    expect(unit).to.be.equal('dimensionless');
  });

  it('functions: ifgt etc', () => {
    let y10 = p.namespaceStorage.get('nameless').get('y10');
    let expr = y10.assignments.start_;
    let unit = expr.calcUnit(y10).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });

  it('ternary operator', () => {
    let y11 = p.namespaceStorage.get('nameless').get('y11');
    let expr = y11.assignments.start_;
    let unit = expr.calcUnit(y11).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });

  it('piecewise operator 3 arguments', () => {
    let y12 = p.namespaceStorage.get('nameless').get('y12');
    let expr = y12.assignments.start_;
    let unit = expr.calcUnit(y12).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });

  it('piecewise operator 2 arguments', () => {
    let y13 = p.namespaceStorage.get('nameless').get('y13');
    let expr = y13.assignments.start_;
    let unit = expr.calcUnit(y13).toString();
    expect(unit).to.be.equal('(1e-3 mole)/litre');
  });
  
  it('piecewise operator 5 arguments', () => {
    let y14 = p.namespaceStorage.get('nameless').get('y14');
    let expr = y14.assignments.start_;
    let unit = expr.calcUnit(y14).toString();
    expect(unit).to.be.equal('dimensionless');
  });

  it('No warnings', () => {
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    //console.log(p.defaultLogs)
    expect(warnings).to.be.lengthOf(0);
  });
});
