/* global describe, it */
const { DSwitcher } = require('../../src/core/d-switcher');
const { expect } = require('chai');

describe('Simple test for DSwitcher', () => {
  it('Set minimal properties', () => {
    let sw1 = (new DSwitcher).merge({
      id: 'sw1',
      trigger: '(x>1) and (y!=x)',
      atStart: false
    });
    expect(sw1.toQ()).to.be.deep.equal({
      id: 'sw1',
      class: 'DSwitcher',
      trigger: '(x > 1) and (y != x)'
    });
  });
  it('Set maximal properties', () => {
    let sw1 = (new DSwitcher).merge({
      id: 'sw1',
      trigger: 'x>y',
      atStart: true
    });
    expect(sw1.toQ()).to.be.deep.equal({
      id: 'sw1',
      class: 'DSwitcher',
      trigger: 'x > y',
      atStart: true
    });
  });
});
