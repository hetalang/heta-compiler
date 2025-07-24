/* global describe, it */
const { expect } = require('chai');

const { _parsePath, _setByPathArray } = require('../../src/utils');

function _setByPathArrayWrapper(o, pathArray, value) {
    return _setByPathArray.call(o, pathArray, value);
}

describe('Correct _setByPathArray()', () => {
  it('should set simple path', () => {
    let o = {};
    let pathArray = ['a', 'b', 'c'];
    _setByPathArrayWrapper(o, pathArray, 42);
    expect(o).to.be.deep.equal({ a: { b: { c: 42 } } });
  });

  it('should set path with array index', () => {
    let o = {};
    let pathArray = ['a', 1, 'b', 2, 'c'];
    _setByPathArrayWrapper(o, pathArray, 100);
    expect(o).to.be.deep.equal({ a: [undefined, { b: [undefined, undefined, { c: 100 }] }] });
  });

  it('should handle empty path', () => {
    let o = {};
    let pathArray = [];
    _setByPathArrayWrapper(o, pathArray, 'empty');
    expect(o).to.be.deep.equal({});
  });

  it('should set values to array indices', () => {
    let o = {a: []};
    let pathArray = ['a', 1, 'b', 2];
    _setByPathArrayWrapper(o, pathArray, 'value');
    expect(o).to.be.deep.equal({ a: [undefined, { b: [undefined, undefined, 'value'] }] });
  });

  it('should set values to array replacing objects', () => {
    let o = {a: {b: {c: 1}}};
    let pathArray = ['a', 'b', 2, 'd'];
    _setByPathArrayWrapper(o, pathArray, 'value');
    expect(o).to.be.deep.equal({ a: { b: [undefined, undefined, { d: 'value' }] } });
  });
});