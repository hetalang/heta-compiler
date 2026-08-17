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

  it('Reject null for num', () => {
    let con = new Const().merge({ id: 'k1', num: 1 });
    con.merge({ num: null });
    expect(con.toQ().num).to.equal(1);
  });

  it('Set num to Infinity', () => {
    let con = new Const();
    con.merge({ id: 'k1', num: Infinity });
    expect(con.toQ().num).to.equal(Infinity);
  });

  it('Set num to NaN', () => {
    let con = new Const();
    con.merge({ id: 'k1', num: NaN });
    expect(con.toQ().num).to.be.NaN;
  });

  it('Normalizes special num strings', () => {
    expect(new Const().merge({ num: 'Infinity' }).num).to.equal(Infinity);
    expect(new Const().merge({ num: '+Infinity' }).num).to.equal(Infinity);
    expect(new Const().merge({ num: '-Infinity' }).num).to.equal(-Infinity);
    expect(new Const().merge({ num: 'NaN' }).num).to.be.NaN;
  });

  it('Rejects all other num strings', () => {
    ['inf', 'NaN ', 'not-a-number'].forEach((num) => {
      let con = new Const().merge({ id: 'k1', num: 1 });
      con.merge({ num });
      expect(con.num, num).to.equal(1);
    });
  });
});
