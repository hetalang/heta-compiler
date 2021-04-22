/* global describe, it*/
const { expect } = require('chai');
const { Container } = require('../../src');

let qArr = [
  {action: 'defineUnit', id: 'kcell', units: [{kind: 'item', scale: 1e3}]},
  {action: 'defineUnit', id: 'mM', units: [{kind: 'mole', scale: 1e-3}, {kind: 'litre', exponent: -1}]},
  {action: 'defineUnit', id: 'xxx', units: [{kind: 'yyy'}]},
  {action: 'insert', id: 'c1', class: 'Compartment', assignments: {start_: 1}},
  {action: 'insert', id: 's1', class: 'Species', compartment: 'c1', units: 'mM', assignments: {start_: 10}},
  {action: 'insert', id: 's2', class: 'Species', isAmount: true, compartment: 'c1', units: 'kcell', assignments: {start_: 0}},
  {action: 'insert', id: 's3', class: 'Species', compartment: 'c1', assignments: {start_: 10}},
  {action: 'insert', id: 's4', class: 'Species', compartment: 'c1', units: 'xxx', assignments: {start_: 10}},
  {action: 'insert', id: 's5', class: 'Species', compartment: 'c1', units: 'mole', assignments: {start_: 10}}
];

describe('Testing correct terms for Species', () => {
  let p;

  it('Create and knit', () => {
    p = new Container();
    p.loadMany(qArr);
    p.knitMany();
    expect(p.logger).to.have.property('hasErrors').true; // error in xxx UnitDefinition
    p.logger.resetErrors();
    p.defaultLogs.length = 0;
  });

  it('Check legal terms', () => {
    p.checkTerms();
    expect(p.logger).to.have.property('hasErrors').false;
    //console.log(p.defaultLogs);
    expect(p.defaultLogs).to.be.lengthOf(2);
  });
});
