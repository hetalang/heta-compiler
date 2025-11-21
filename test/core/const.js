/* global describe, it */
const { Const } = require('../../src/core/const');
const { expect } = require('chai');

describe('Unit tests for Const.', () => {
  it('Minimal properties set', () => {
    let con = (new Const).merge({
      id: 'k1',
      class: 'Const',
      num: 1.5
    });
    expect(con.toQ()).to.be.deep.equal({
      class: 'Const',
      id: 'k1',
      num: 1.5
    });
  });
  it('Maximal properties set', () => {
    let con = (new Const).merge({
      id: 'k1',
      class: 'Const',
      num: 1.5,
      free: true,
      scale: 'log',
      lower: 1e-9,
      upper: 1e9
    });
    expect(con.toQ()).to.be.deep.equal({
      class: 'Const',
      id: 'k1',
      num: 1.5,
      free: true,
      scale: 'log',
      lower: 1e-9,
      upper: 1e9
    });
  });
});

// Silent failures - just ignore properies
// XXX: not good but for now...
describe('Wrong usage tests for Const.', () => {
  it('Set string to num', () => {
    let con = new Const();
    con.merge({ id: 'k1', num: 'string' });
    expect(con.toQ().num).to.be.undefined;
  });

  it('Set string to free', () => {
    let con = new Const();
    con.merge({ id: 'k1', free: 'string' });
    expect(con.toQ().free).to.be.undefined;
  });

  it('Set num to Infinity', () => {
    let con = new Const();
    con.merge({ id: 'k1', num: Infinity });
    expect(con.toQ().num).to.be.undefined;
  });

  it('Set num to NaN', () => {
    let con = new Const();
    con.merge({ id: 'k1', num: NaN });
    expect(con.toQ().num).to.be.undefined;
  });
});