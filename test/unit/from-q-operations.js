/* global describe, it*/
const { expect } = require('chai');
const { Unit } = require('../../src/core/unit');

const correctUnits = [
  {
    source: [],
    targetString: '1',
    targetHash: '_1',
    targetHTML2: '<div class="unit-mult" style="display:inline-block">1</div>'
  },
  {
    source: [{kind: ''}],
    targetString: '1',
    targetHash: '_1',
    targetHTML2: '<div class="unit-mult" style="display:inline-block">1</div>'
  },
  {
    source: [{kind: '', multiplier: 1e-3}],
    targetString: '(1e-3 )',
    targetHash: '_1n3',
    targetHTML2: '<div class="unit-mult" style="display:inline-block">(1e-3 )</div>'
  },
  {
    source: [
      { kind: 'g' },
      { kind: 'L', exponent: -1 }
    ],
    targetString: 'g/L',
    targetHash: '_g__L',
    targetHTML2: '<div class="unit-ratio" style="display:inline-block;text-align:center"><div class="unit-mult" style="display:inline-block">g</div><hr/><div class="unit-mult" style="display:inline-block">L</div></div>'
  },
  {
    source: [
      { kind: 'g', multiplier: 1e-6 },
      { kind: 'L', multiplier: 1e-3, exponent: -1 }
    ],
    targetString: '(1e-6 g)/(1e-3 L)',
    targetHash: '_1n6g__1n3L',
    targetHTML2: '<div class="unit-ratio" style="display:inline-block;text-align:center"><div class="unit-mult" style="display:inline-block">(1e-6 g)</div><hr/><div class="unit-mult" style="display:inline-block">(1e-3 L)</div></div>'
  },
  {
    source: [
      { kind: 'g', multiplier: 1e-6 },
      { kind: 'L', multiplier: 1e-3, exponent: -1 },
      { kind: 'kg' },
      { kind: 'm', multiplier: 1e-2, exponent: -2 }
    ],
    targetString: '(1e-6 g)/(1e-3 L)*kg/(1e-2 m)^2',
    targetHash: '__1n2m2_kg_1n6g__1n3L',
    targetHTML2: '<div class="unit-ratio" style="display:inline-block;text-align:center"><div class="unit-mult" style="display:inline-block">(1e-6 g)&times;kg</div><hr/><div class="unit-mult" style="display:inline-block">(1e-3 L)&times;(1e-2 m)<sup>2</sup></div></div>'
  }
];

describe('Testing operations with complex units', () => {
  correctUnits.forEach((x) => {
    let unit;

    it('fromQ() static method', () => {
      unit = Unit.fromQ(x.source);
    });

    it('toString() method', () => {
      let res = unit.toString();
      expect(res).to.be.equal(x.targetString);
    });

    it('toHash() method', () => {
      let res = unit.toHash();
      expect(res).to.be.equal(x.targetHash);
    });

    if (x.targetHTML2) it('toHTML2() method', () => {
      let res = unit.toHTML2(' ', '&times;', '-');
      expect(res).to.be.equal(x.targetHTML2);
    });
  });
});