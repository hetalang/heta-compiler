/* global describe, it*/
const { expect } = require('chai');
const { TimeSwitcher } = require('../../src/core/time-switcher');

describe('Test TimeSwitcher methods', () => {
  it('Simple TimeSwitcher', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4, stop: 120 });
    expect(ts1.getStart()).to.be.equal(12);
    expect(ts1.getPeriod()).to.be.equal(6);
    expect(ts1.getRepeatCountInt()).to.be.equal(4);
    expect(ts1.getStop()).to.be.equal(120);
  });

  it('getRepeatCountInt() 1', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4});
    expect(ts1.getRepeatCountInt()).to.be.equal(4);
  });

  it('getRepeatCountInt() 2', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12 });
    expect(ts1.getRepeatCountInt()).to.be.equal(0);
  });

  it('getRepeatCountInt() 3', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4});
    expect(ts1.getRepeatCountInt()).to.be.equal(4);
  });

  it('getRepeatCountInt() 4', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, stop: 120 });
    expect(ts1.getRepeatCountInt()).to.be.equal(17);
  });

  it('getRepeatCountInt() 5', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4, stop: 120 });
    expect(ts1.getRepeatCountInt()).to.be.equal(4);
  });
  
  it('getRepeatCountInt() 6', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 400, stop: 120 });
    expect(ts1.getRepeatCountInt()).to.be.equal(17);
  });

  it('getRepeatCountInt() 7', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, repeatCount: 400, stop: 120 });
    expect(ts1.getRepeatCountInt()).to.be.equal(400);
  });
});
