/* global describe, it */
const { expect } = require('chai');
const { Container } = require('../../src');

const platform0 = [
  { id: 'meter', action: 'defineUnit' },
  { id: 'kilogram', action: 'defineUnit' },
  {
    id: 'liter',
    action: 'defineUnit',
    units: [
      { kind: 'meter', exponent: 3, multiplier: 1e-1 }
    ]
  },
  {
    id: 'xxx',
    action: 'defineUnit',
    units: [
      { kind: 'meter', exponent: 2, multiplier: 1e-3 },
      { kind: 'liter', exponent: -1, multiplier: 1 }
    ] 
  }
];

describe('unit transformation 0', () => {
  let c;

  it('Create platform', () => {
    c = (new Container)
      .loadMany(platform0)
      .knitMany();
  });

  it('Elementary unit transformation', () => {
    let meter = c.unitDefStorage.get('meter');

    expect(() => meter.unitsParsed.rebase(['meter', 'liter'])).to.throw(TypeError);
  });

  it('Simple unit tranformation.', () => {
    let liter = c.unitDefStorage.get('liter');
    let res0 = liter.unitsParsed.rebase(['meter', 'kilogram']);
    expect(res0.toString()).to.be.equal('(1e-1 meter)^3');
  });

  it('Simple unit tranformation error.', () => {
    let liter = c.unitDefStorage.get('liter');
    expect(() => liter.unitsParsed.rebase(['liter', 'kilogram']))
      .to.throw(TypeError);
  });

  it('Complex unit transformation 1', () => {
    let xxx = c.unitDefStorage.get('xxx');
    let res0 = xxx.unitsParsed.rebase(['kilogram', 'liter', 'meter']);
    expect(res0.toString()).to.be.equal('(1e-3 meter)^2/liter');
  });

  it('Complex unit transformation 2', () => {
    let xxx = c.unitDefStorage.get('xxx');
    let res0 = xxx.unitsParsed.rebase(['kilogram', 'meter']);
    expect(res0.toString()).to.be.equal('(1e-3 meter)^2/(1e-1 meter)^3');
  });

  it('Complex unit transformation error', () => {
    let xxx = c.unitDefStorage.get('xxx');
    expect(() => xxx.unitsParsed.rebase(['kilogram', 'liter']))
      .to.throw(Error);
  });

});

const platform1 = [
  { id: 'second', action: 'defineUnit' },
  { id: 'hour', action: 'defineUnit', units: [{ kind: 'second', exponent: 1, multiplier: 3600 }] },
  { id: 'h', action: 'defineUnit', units: 'hour' },
  { id: 'kel', class: 'Const', num: 1.2, units: '1/h' }
];

describe('Hour problem testing', () => {
  let c;

  it('Create platform', () => {
    c = (new Container)
      .loadMany(platform1)
      .knitMany();
  });

  it('SBML-like transformation for UnitDef', () => {
    let h = c.unitDefStorage.get('h');
    let res0 = h.unitsParsed.rebase(['second']);
    expect(res0.toString()).to.be.equal('(3.6e+3 second)');
  });

  it('Simbio-like transformation for UnitDef', () => {
    let h = c.unitDefStorage.get('h');
    let res0 = h.unitsParsed.rebase(['hour']);
    expect(res0.toString()).to.be.equal('hour');
  });

  it('Error transformation for UnitDef', () => {
    let h = c.unitDefStorage.get('h');
    expect(() => h.unitsParsed.rebase(['week'])).to.throw(Error);
  });

  it('SBML-like transformation Const', () => {
    let kel = c.select({id: 'kel'});
    let res0 = kel.unitsParsed.rebase(['second']);
    expect(res0.toString()).to.be.equal('1/(3.6e+3 second)');
  });
  
  it('Simbio-like transformation Const', () => {
    let kel = c.select({id: 'kel'});
    let res0 = kel.unitsParsed.rebase(['hour']);
    expect(res0.toString()).to.be.equal('1/hour');
  });
    
  it('Error transformation Const', () => {
    let kel = c.select({id: 'kel'});
    
    expect(() => kel.unitsParsed.rebase(['week'])).to.throw(TypeError);
  });
});
