/* global describe, it*/
const { expect } = require('chai');
const { TimeSwitcher } = require('../../src/core/time-switcher');

describe('Test TimeSwitcher methods', () => {
  it('Simple TimeSwitcher', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4, stop: 120 });
    expect(ts1).to.have.property('start', 12);
    expect(ts1).to.have.property('period', 6);
    expect(ts1).to.have.property('repeatCount', 4);
    expect(ts1).to.have.property('stop', 120);
  });

  it('getRepeatCount() 1', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4});
    expect(ts1.getRepeatCount()).to.be.equal(4);
  });

  it('getRepeatCount() 2', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12 });
    expect(ts1.getRepeatCount()).to.be.equal(0);
  });

  it('getRepeatCount() 3', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4});
    expect(ts1.getRepeatCount()).to.be.equal(4);
  });

  it('getRepeatCount() 4', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, stop: 120 });
    expect(ts1.getRepeatCount()).to.be.equal(17);
  });

  it('getRepeatCount() 5', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 4, stop: 120 });
    expect(ts1.getRepeatCount()).to.be.equal(4);
  });
  
  it('getRepeatCount() 6', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, period: 6, repeatCount: 400, stop: 120 });
    expect(ts1.getRepeatCount()).to.be.equal(17);
  });

  it('getRepeatCount() 7', () => {
    let ts1 = new TimeSwitcher();
    ts1.merge({ start: 12, repeatCount: 400, stop: 120 });
    expect(ts1.getRepeatCount()).to.be.equal(17);
  });
});
