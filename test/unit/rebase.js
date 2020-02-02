/* global describe, it */
const { expect } = require('chai');
const { Container } = require('../../src');

const platform0 = [
  { id: 'meter', class: 'UnitDef' },
  { id: 'kilogram', class: 'UnitDef' },
  {
    id: 'liter',
    class: 'UnitDef',
    units: [
      { kind: 'meter', exponent: 3, multiplier: 1e-1 }
    ]
  },
  {
    id: 'xxx',
    class: 'UnitDef',
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
      .populate();
  });

  it('Elementary unit transformation', () => {
    let meter = c.select({id: 'meter'});

    expect(() => meter.unitsParsed.rebase(['meter', 'liter'])).to.throw(TypeError);
  });

  it('Simple unit tranformation.', () => {
    let liter = c.select({id: 'liter'});
    let res0 = liter.unitsParsed.rebase(['meter', 'kilogram']);
    expect(res0.toString()).to.be.equal('(1e-1 meter)^3');
  });

  
  it('Simple unit tranformation error.', () => {
    let liter = c.select({id: 'liter'});
    expect(() => liter.unitsParsed.rebase(['liter', 'kilogram']))
      .to.throw(TypeError);
  });

  it('Complex unit transformation 1', () => {
    let xxx = c.select({id: 'xxx'});
    let res0 = xxx.unitsParsed.rebase(['kilogram', 'liter', 'meter']);
    expect(res0.toString()).to.be.equal('(1e-3 meter)^2/liter');
  });

  it('Complex unit transformation 2', () => {
    let xxx = c.select({id: 'xxx'});
    let res0 = xxx.unitsParsed.rebase(['kilogram', 'meter']);
    expect(res0.toString()).to.be.equal('(1e-3 meter)^2/(1e-1 meter)^3');
  });

  it('Complex unit transformation error', () => {
    let xxx = c.select({id: 'xxx'});
    expect(() => xxx.unitsParsed.rebase(['kilogram', 'liter']))
      .to.throw(Error);
  });

});

const platform1 = [
  { id: 'second', class: 'UnitDef' },
  { id: 'hour', class: 'UnitDef', units: [{ kind: 'second', exponent: 1, multiplier: 3600 }] },
  { id: 'h', class: 'UnitDef', units: 'hour' },
  { id: 'kel', class: 'Const', num: 1.2, units: '1/h' }
];

describe('Hour problem testing', () => {
  let c;

  it('Create platform', () => {
    c = (new Container)
      .loadMany(platform1)
      .populate();
  });

  it('SBML-like transformation for UnitDef', () => {
    let h = c.select({id: 'h'});
    let res0 = h.unitsParsed.rebase(['second']);
    expect(res0.toString()).to.be.equal('(3.6e+3 second)');
  });

  it('Simbio-like transformation for UnitDef', () => {
    let h = c.select({id: 'h'});
    let res0 = h.unitsParsed.rebase(['hour']);
    expect(res0.toString()).to.be.equal('hour');
  });

  it('Error transformation for UnitDef', () => {
    let h = c.select({id: 'h'});
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
