/* global describe, it*/
const { expect } = require('chai');
const { TimeSwitcher } = require('../../src/core/time-switcher');

describe('Test TimeSwitcher methods', () => {
  it('Simple TimeSwitcher', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, stop: 120 });
    expect(ts1.getStart()).to.be.equal(12);
    expect(ts1.getPeriod()).to.be.equal(6);
    expect(ts1.getStop()).to.be.equal(120);
  });

  it('Rejects null in an inline Const num', () => {
    expect(TimeSwitcher.isValid({ start: { num: null } })).to.be.false;
  });
});
