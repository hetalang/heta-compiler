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
