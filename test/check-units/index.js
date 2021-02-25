/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr = [
  {action: 'defineUnit', id: 'mM', units: '(1e-3 mole)/litre'},
  {id: 'k1', class: 'Const', units: '1', num:  1e-3},
  {id: 'k2', class: 'Const', units: 'mM', num:  1.5},
  {id: 'x1', class: 'Record', units: 'mM', assignments: {start_: 1}},
  {id: 'x2', class: 'Record', units: 'mM', assignments: {ode_: 15}},
  {action: 'insert', id: 'y1', class: 'Record', units: 'mM', assignments: {start_: 'k1*x1', ode_: 'k2+x2'}},
  {action: 'insert', id: 'y2', class: 'Record', units: '1', assignments: {start_: 'k1+x1', ode_: 'k2+x2'}},
  {action: 'insert', id: 'y3', class: 'Record', assignments: {start_: '1'}},
  {action: 'insert', id: 'sw1', class: 'DSwitcher', trigger: 'true'},
  {action: 'insert', id: 'sw2', class: 'DSwitcher', trigger: '(x1>x2) and false'},
  {action: 'insert', id: 'sw3', class: 'CSwitcher', trigger: 'y1'},
  {action: 'insert', id: 'sw4', class: 'DSwitcher', trigger: 'true and x1'}
];

describe('Testing checkUnits() for components', () => {
  let p;

  it('Create and knit', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    expect(p.logger).to.have.property('hasErrors').false;
  });

  it('No warnings for y1', () => {
    let y1 = p.namespaceStorage.get('nameless').get('y1');
    y1.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(0);
    p.defaultLogs.length = 0; // reset
  });

  it('Warnings for y2: inconsistency', () => {
    let y2 = p.namespaceStorage.get('nameless').get('y2');
    y2.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(2);
    p.defaultLogs.length = 0; // reset
  });

  it('Warnings for y3: no units', () => {
    let y3 = p.namespaceStorage.get('nameless').get('y3');
    y3.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(1);
    p.defaultLogs.length = 0; // reset
  });

  it('No warnings for sw1', () => {
    let sw1 = p.namespaceStorage.get('nameless').get('sw1');
    sw1.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(0);
    p.defaultLogs.length = 0; // reset
  });

  it('No warnings for sw2', () => {
    let sw2 = p.namespaceStorage.get('nameless').get('sw2');
    sw2.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(0);
    p.defaultLogs.length = 0; // reset
  });

  it('No warnings for sw3', () => {
    let sw3 = p.namespaceStorage.get('nameless').get('sw3');
    sw3.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(0);
    p.defaultLogs.length = 0; // reset
  });

  it('Warnings for sw4', () => {
    let sw4 = p.namespaceStorage.get('nameless').get('sw4');
    sw4.checkUnits();
    let warnings = p.defaultLogs.filter(x=>x.level==='warn');
    expect(warnings).to.be.lengthOf(1);
    p.defaultLogs.length = 0; // reset
  });
});
