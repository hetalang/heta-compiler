/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Check setScenario action', () => {
  var c;

  it('Create container', () => {
    c = new Container();
    expect(c.logger).property('hasErrors').false;
  });

  it('add minimal scenario', () => {
    let scn1 = c.setScenario({
      id: 'scn1',
      tspan: [0, 120]
    });

    expect(c.logger).property('hasErrors', false);
    expect(scn1).to.have.property('id', 'scn1');
    c.logger.resetErrors();
  });
});

describe('Knit correct scenarios', () => {
  let c;

  it('Create container', () => {
    c = new Container();
    // content
    c.loadMany([
      {id: 'x1', class: 'Record', assignments: {start_: '1.1'}},
      {id: 'x2', class: 'Record', assignments: {start_: '0'}},
      {id: 'pr1', class: 'Process', actors: 'x1=>x2', assignments: {ode_: 'k1*x1'}},
      {id: 'k1', class: 'Const', num: 1e-3},
      {id: 'k2', class: 'Const', num: 7.7},
      {id: 'sw1', class: 'TimeSwitcher', start: 5.5},
      {id: 'sw2', class: 'DSwitcher', trigger: 'x2<x1'},
      {
        id: 'scn1',
        action: 'setScenario',
        tspan: [0,100]
      },
      {
        id: 'scn2',
        action: 'setScenario',
        saveat: [0,20,30,100],
        parameters: {k1: 20, k2: 1e-3},
        observables: ['x1', 'x2', 'pr1'],
        events_active: {sw1: false, sw2: true},
        events_save: {sw2: [true, false]}
      }
    ]);
    expect(c.logger).to.have.property('hasErrors').false;
  });

  it('Knit all', () => {
    c.knitMany();
    expect(c.logger).to.have.property('hasErrors').false;
  });
});

describe('Knit incorrect scenarios', () => {
  let c;

  it('Create container', () => {
    c = new Container();
    // content
    c.loadMany([
      {id: 'x1', class: 'Record', assignments: {start_: '1.1'}},
      {id: 'x2', class: 'Record', assignments: {start_: '0'}},
      {id: 'pr1', class: 'Process', actors: 'x1=>x2', assignments: {ode_: 'k1*x1'}},
      {id: 'k1', class: 'Const', num: 1e-3},
      {id: 'k2', class: 'Const', num: 7.7},
      {id: 'sw1', class: 'TimeSwitcher', start: 5.5},
      {id: 'sw2', class: 'DSwitcher', trigger: 'x2<x1'},
      {
        id: 'scn1',
        model: 'mouse',
        action: 'setScenario',
        tspan: [0,100]
      },
      {
        id: 'scn2',
        action: 'setScenario',
        saveat: [0,20,30,100],
        parameters: {x1: 20, k3: 1e-3, sw1: 1.1},
        observables: ['x3', 'k2', 'sw1'],
        events_active: {k1: false, xxx: true},
        events_save: {sw3: [true, false]}
      }
    ]);
    // no errors here
    expect(c.logger).to.have.property('hasErrors').false;
  });

  it('Knit all', () => {
    c.knitMany();
    // binding errors
    expect(c.logger).to.have.property('hasErrors').true;
    expect(c.hetaErrors()).to.be.lengthOf(10);
  });
  /*
  it('log', () => {
    console.log(c.hetaErrors());
  });
  */
});
