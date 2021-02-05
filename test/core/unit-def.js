/* global describe, it */
const Container = require('../../src/container');
const p = new Container();
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  it('Error: Empty UnitDef', () => {
    let simple = new p.UnitDef();

    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });

  it('Correct UnitDef', () => {
    let simple = new p.UnitDef({
      id: 'ud1',
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    
    expect(simple._container.logger).to.has.property('hasErrors', false);
    expect(simple.toQ()).to.be.deep.equal({
      action: 'defineUnit',
      id: 'ud1',
      units: '(1e+3 g)/mole'
    });
    expect(simple.toQ({noUnitsExpr: true})).to.be.deep.equal({
      action: 'defineUnit',
      id: 'ud1',
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1, multiplier: 1}
      ]
    });
    
    expect(simple._container.logger).property('hasErrors').false;
    simple._container.logger.resetErrors();
  });

  it('Error: wrong input 1.', () => {
    let simple1 = new p.UnitDef({
      id: 'u1',
      units: ['xxx']
    });

    expect(simple1._container.logger).to.has.property('hasErrors').true;
    simple1._container.logger.resetErrors();
  });

  it('Error: wrong input 2.', () => {
    let simple2 = new p.UnitDef({
      units: [{}]
    });
    expect(simple2._container.logger).to.has.property('hasErrors', true);
    simple2._container.logger.resetErrors();
  });
});
