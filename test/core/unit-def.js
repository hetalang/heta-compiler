/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Unit test for UnitDef', () => {
  const p = new Container();
  it('Error: Empty UnitDef', () => {
    let simple = new p.classes.UnitDef().merge({});
    
    expect(simple._container.logger).property('hasErrors').true;
    simple._container.logger.resetErrors();
  });

  it('Correct UnitDef', () => {
    let simple = new p.classes.UnitDef().merge({
      id: 'ud1',
      units: [
        {kind: 'g', multiplier: 1e3, exponent: 1},
        {kind: 'mole', exponent: -1}
      ]
    });
    
    expect(simple._container.logger).to.has.property('hasErrors', false);
    expect(simple.toQ({useUnitsExpr: true})).to.be.deep.equal({
      action: 'defineUnit',
      id: 'ud1',
      units: '(1e+3 g)/mole'
    });
    expect(simple.toQ({useUnitsExpr: false})).to.be.deep.equal({
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
    let simple1 = new p.classes.UnitDef().merge({
      id: 'u1',
      units: ['xxx']
    });
    
    expect(simple1._container.logger).to.has.property('hasErrors').true;
    simple1._container.logger.resetErrors();
  });

  it('Error: wrong input 2.', () => {
    let simple2 = new p.classes.UnitDef().merge({
      units: [{}]
    });
    expect(simple2._container.logger).to.has.property('hasErrors', true);
    simple2._container.logger.resetErrors();
  });
});

let input0 = [
  {
    action: 'defineUnit',
    id: 'base',
    terms: []
  },
  {
    action: 'defineUnit',
    id: 'L',
    terms: []
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
    p.logger.resetErrors();
  });
});

describe('Testing UnitDef with "terms"', () => {
  const p = new Container();

  it('Error: units without "units" and "terms"', () => {
    let ud0 = new p.classes.UnitDef().merge({id: 'ud0'});
    expect(ud0).to.have.property('errored').true;
  });

  it('Error: units with "terms" only', () => {
    let ud1 = new p.classes.UnitDef().merge({id: 'ud1', terms: [{kind: 'time'}]});
    expect(ud1).to.not.have.property('errored').true;
  });

  it('Error: units with "units" and "terms"', () => {
    let ud2 = new p.classes.UnitDef().merge({id: 'ud2', terms: [{kind: 'time'}], units: [{kind: 'litre'}]});
    expect(ud2).to.have.property('errored').true;
  });
  
  it('UnitDef with empty "terms"', () => {
    let ud3 = new p.classes.UnitDef().merge({id: 'ud3', terms: []});
    expect(ud3).to.not.have.property('errored').true;
  });
});

