/* global describe, it */
const { expect } = require('chai');
const { createUnitTransformation } = require('../../src/core/unit');
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

const platform1 = [
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
    id: 'l',
    class: 'UnitDef',
    units: [
      {
        kind: 'liter',
        exponent: 1,
        kingObj: {
          id: 'liter',
          className: 'UnitDef',
          unitsParsed: [
            { kind: 'meter', exponent: 3, multiplier: 1e-1 }
          ]
        }
      }
    ]
  },
  {
    id: 'xxx',
    class: 'UnitDef',
    units: [
      { kind: 'l', exponent: 1 },
      { kind: 'meter', exponent: -2 }
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

  it('Legal complex unit at zero level.', () => {
    let two = c.select({id: 'liter'});
    let res = two.rebased(['liter', 'kilogram']);
    expect(res).to.be.undefined;
  });

  it('Legal simple unit at zero level.', () => {
    let one = c.select({id: 'kilogram'});
    let res = one.rebased(['liter', 'kilogram']);
    expect(res).to.be.undefined;
  });

  it('Not legal unit at zero level', () => {
    let zero = c.select({id: 'meter'});
    expect(() => zero.rebased(['kilogram'])).to.throw(Error);
  });

  it('Legal complex unit at second level.', () => {
    let two = c.select({id: 'liter'});
    let res = two.rebased(['meter', 'kilogram']);
    expect(res).to.be.lengthOf(1);
    expect(res[0]).to.be.deep.equal({kind: 'meter', exponent: 3, multiplier: 1e-1});
  });

  it('Legal unit at second level', () => {
    let three = c.select({id: 'xxx'});
    let res = three.rebased(['kilogram', 'liter', 'meter']);

    expect(res).to.be.lengthOf(2);
  });

  it('Legal unit at third level', () => {
    let three = c.select({id: 'xxx'});
    let res = three.rebased(['kilogram', 'meter']);
    console.log(res)

    //expect(res).to.be.lengthOf(2);
  });
});

/*
  it('Create platform1', () => {
    c1 = (new Container)
      .loadMany(platform1)
      .populate();
  });

  it('Two transformations 1.', () => {
    let pop = c1.getPopulation();
    let res = createUnitTransformation(pop);

    expect(res).to.be.deep.include({
      liter: [ { kind: 'meter', exponent: 3, multiplier: 0.1 } ],
      l: [ { kind: 'meter', exponent: 3, multiplier: 0.1 } ],
      xxx: [ { kind: 'meter', exponent: 3, multiplier: 0.1 }, { kind: 'meter', exponent: -2 } ]
    });
    
    console.log(res);
  });

  it('Two transformations 2.', () => {
    let pop = c1.getPopulation();
    let res = createUnitTransformation(pop, ['liter']);
    
    expect(res).to.be.deep.equal({
      l: [ { kind: 'liter', exponent: 1 } ],
      xxx: [ { kind: 'liter', exponent: 1 }, { kind: 'meter', exponent: -2 } ]
    });

    console.log(res);
  });
  */