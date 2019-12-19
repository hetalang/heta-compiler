/* global describe, it */
const { expect } = require('chai'); 
const { Container } = require('../../src');

let input0 = [
  {
    class: 'UnitDef',
    id: 'base'
  },
  {
    class: 'UnitDef',
    id: 'L'
  },
  {
    class: 'UnitDef',
    id: 'mbase',
    units: [
      { kind: 'base', multiplier: 1e-3, exponent: 1 }
    ]
  },
  {
    class: 'UnitDef',
    id: 'mbase_per_L2',
    units: [
      { kind: 'base', multiplier: 1e-3, exponent: 1 },
      { kind: 'L', multiplier: 1, exponent: -2 }
    ]
  }
];

describe('Testing UnitDef.', () => {
  let c = new Container();

  it('Load unitDef', () => {
    c.loadMany(input0);
    expect(c).to.be.lengthOf(4);
  });
});
