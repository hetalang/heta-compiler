/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit test for Scenario', () => {
  const c = new Container();

  it('Minimal correct scenario', () => {
    let scn1 = new c.classes.Scenario().merge({
      id: 'scn1',
      tspan: [0, 120]
    });
    expect(c.logger).property('hasErrors').false;

    expect(scn1).has.property('model', 'nameless');

    expect(scn1.toQ()).to.be.deep.equal({
      action: 'setScenario',
      id: 'scn1',
      tspan: [0, 120]
    });

    expect(c.logger).property('hasErrors').false;
    c.logger.resetErrors();
  });

  it('Maximal correct scenario', () => {
    let scn2 = new c.classes.Scenario().merge({
      id: 'scn2',
      model: 'mouse',
      parameters: {weight: 20, kel: 1e-3},
      saveat: [0, 1, 2, 4, 6, 8, 10, 12],
      observables: ['A0', 'C1', 'C2'],
      events_active: {sw1: false, sw2: true},
      events_save: {sw2: [true, false]}
    });
    expect(c.logger).property('hasErrors').false;

    expect(scn2.toQ()).to.be.deep.equal({
      action: 'setScenario',      
      id: 'scn2',
      model: 'mouse',
      parameters: {weight: 20, kel: 1e-3},
      saveat: [0, 1, 2, 4, 6, 8, 10, 12],
      observables: ['A0', 'C1', 'C2'],
      events_active: {sw1: false, sw2: true},
      events_save: {sw2: [true, false]}
    });
    expect(c.logger).property('hasErrors').false;
    c.logger.resetErrors();
  });

  it('Wrong "model" property', () => {
    let scn3 = new c.classes.Scenario().merge({
      id: 'scn3',
      model: '123'
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('Wrong "parameters" argument', () => {
    let scn4 = new c.classes.Scenario().merge({
      id: 'scn4',
      parameters: []
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('No "saveat" or "tspan" arguments', () => {
    let scn5 = new c.classes.Scenario().merge({
      id: 'scn5'
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('Wrong "saveat" argument', () => {
    let scn6 = new c.classes.Scenario().merge({
      id: 'scn6',
      saveat: ['a']
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('Wrong "tspan" argument', () => {
    let scn7 = new c.classes.Scenario().merge({
      id: 'scn7',
      tspan: []
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('Wrong "tspan" argument', () => {
    let scn8 = new c.classes.Scenario().merge({
      id: 'scn8',
      tspan: [10, 0]
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });

  it('Wrong "observables" argument', () => {
    let scn9 = new c.classes.Scenario().merge({
      id: 'scn9',
      observables: [0, 0]
    });

    expect(c.logger).property('hasErrors').true;
    c.logger.resetErrors();
  });
});
