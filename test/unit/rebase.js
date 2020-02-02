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

    let res0 = meter.unitsParsed.rebase(['meter', 'liter']);
    expect(res0.toString()).to.be.equal('');
  });

  it('Simple unit tranformation.', () => {
    let liter = c.select({id: 'liter'});
    let res0 = liter.unitsParsed.rebase(['meter', 'kilogram']);
    expect(res0.toString()).to.be.equal('(1e-1 meter)^3');
  });

  
  it('Simple unit tranformation error.', () => {
    let liter = c.select({id: 'liter'});
    expect(() => liter.unitsParsed.rebase(['liter', 'kilogram']))
      .to.throw(Error);
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
