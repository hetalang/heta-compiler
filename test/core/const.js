/* global describe, it */
const { Const } = require('../../src/core/const');
const { expect } = require('chai');


describe('Unit tests for Const.', () => {
  it('Minimal properties set', () => {
    let con = (new Const).merge({
      class: 'Const',
      num: 1.5
    });
    con._id = 'k1'
    expect(con.toQ()).to.be.deep.equal({
      class: 'Const',
      id: 'k1',
      num: 1.5
    });
  });
  it('Maximal properties set', () => {
    let con = (new Const).merge({
      class: 'Const',
      num: 1.5,
      free: true,
      scale: 'log',
      lower: 1e-9,
      upper: 1e9
    });
    con._id = 'k1'
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
