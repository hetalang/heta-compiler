/* global describe, it */
const { expect } = require('chai');

const { _parsePath, _getByPathArray } = require('../../src/utils');

function _getByPathArrayWrapper(o, pathArray) {
    return _getByPathArray.call(o, pathArray);
}

describe('Correct _parsePath()', () => {
  it('should parse simple path', () => {
    let path = 'a.b.c';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal(['a', 'b', 'c']);
  });

  it('should parse path with array index', () => {
    let path = 'a[1].b[2].c';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal(['a', 1, 'b', 2, 'c']);
  });

  it('should parse complex path', () => {
    let path = 'a[1].b.c[3].d[4].e';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal(['a', 1, 'b', 'c', 3, 'd', 4, 'e']);
  });

  it('should parse complex path 2', () => {
    let path = 'a[1][3][4][5].g';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal(['a', 1, 3, 4, 5, 'g']);
  });

  it('should parse prop', () => {
    let path = 'a';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal(['a']);
  });

  it('should handle empty path', () => {
    let path = '';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal([]);
  });

  it('should parse path with array index only', () => {
    let path = '[1]';
    let res = _parsePath(path);
    expect(res).to.be.deep.equal([1]);
  });
});

describe('Wrong _parsePath()', () => {
  it('should throw error if "x!y"', () => {
    let path = 'x!y';
    expect(() => _parsePath(path)).to.throw(TypeError);
  });
  
  it('should throw error if "a[qwe]"', () => {
    let path = 'a[qwe]';
    expect(() => _parsePath(path)).to.throw(TypeError);
  });

  it('should throw error if "a[[1]]"', () => {
    let path = 'a[[1]]';
    expect(() => _parsePath(path)).to.throw(TypeError);
  });
});

describe('Correct _getByPathArray()', () => {
  it('should get value by path', () => {
    let o = { a: { b: { c: 42 } } };
    let pathArray = ['a', 'b', 'c'];
    let res = _getByPathArrayWrapper(o, pathArray);
    expect(res).to.equal(42);
  });

  it('should get value by path with array index', () => {
    let o = { a: [{ b: 42 }] };
    let pathArray = ['a', 0, 'b'];
    let res = _getByPathArrayWrapper(o, pathArray);
    expect(res).to.equal(42);
  });

  it('should return undefined for non-existing path', () => {
    let o = { a: { b: { c: 42 } } };
    let pathArray = ['a', 'b', 'd'];
    let res = _getByPathArrayWrapper(o, pathArray);
    expect(res).to.be.undefined;
  });

  it('should return null for null value', () => {
    let o = { a: { b: null } };
    let pathArray = ['a', 'b'];
    let res = _getByPathArrayWrapper(o, pathArray);
    expect(res).to.be.null;
  });

  it('should return undefined for index of object', () => {
    let o = { a: { b: { c: 42 } } };
    let pathArray = ['a', 0];
    let res = _getByPathArrayWrapper(o, pathArray);
    expect(res).to.be.undefined;
  });
});
