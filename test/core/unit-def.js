/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  const p = new Container();
  it('Error: Empty UnitDef', () => {
    let simple = new p.classes.UnitDef();

    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });

  it('Correct UnitDef', () => {
    let simple = new p.classes.UnitDef({
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
    let simple1 = new p.classes.UnitDef({
      id: 'u1',
      units: ['xxx']
    });

    expect(simple1._container.logger).to.has.property('hasErrors').true;
    simple1._container.logger.resetErrors();
  });

  it('Error: wrong input 2.', () => {
    let simple2 = new p.classes.UnitDef({
      units: [{}]
    });
    expect(simple2._container.logger).to.has.property('hasErrors', true);
    simple2._container.logger.resetErrors();
  });
});

let input0 = [
  {
    action: 'defineUnit',
    id: 'base'
  },
  {
    action: 'defineUnit',
    id: 'L'
  },
  {
    action: 'defineUnit',
    id: 'mbase',
    units: [
      { kind: 'base', multiplier: 1e-3, exponent: 1 }
    ]
  },
  {
    action: 'defineUnit',
    id: 'mbase_per_L2',
    units: [
      { kind: 'base', multiplier: 1e-3, exponent: 1 },
      { kind: 'L', multiplier: 1, exponent: -2 }
    ]
  }
];

describe('Testing loading UnitDef', () => {
  const p = new Container();
  let counter = p.unitDefStorage.size;

  it('Load UnitDef', () => {
    p.loadMany(input0);
    expect(p.unitDefStorage.size - counter).to.be.eq(4);
    //console.log([...p.unitDefStorage].map(x=>x[1].unitsParsed))
  });
});
