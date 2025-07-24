/* global describe, it */
const { expect } = require('chai');

const { omitByPaths, _omitByPathArray } = require('../../src/utils');

describe('Correct _omitByPathArray()', () => {
    it('should omit simple path', () => {
        let o = { a: { b: { c: 42 } } };
        let pathArray = ['a', 'b', 'c'];
        _omitByPathArray.call(o, pathArray);
        expect(o).to.be.deep.equal({ a: { b: {} } });
    });

    it('should omit path with array index', () => {
        let o = { a: [undefined, { b: [undefined, undefined, { c: 100 }] }] };
        let pathArray = ['a', 1, 'b', 2, 'c'];
        _omitByPathArray.call(o, pathArray);
        expect(o).to.be.deep.equal({ a: [undefined, { b: [undefined, undefined, {}] }] });
    });
});

describe('Correct omitByPaths()', () => {
    it('should omit simple path', () => {
        let o = { a: { b: { c: 42 } } };
        let paths = ['a.b.c'];
        let res = omitByPaths(o, paths);
        expect(res).to.be.deep.equal({ a: { b: {} } });
    });

    it('should omit multiple paths', () => {
        let o = { a: { b: { c: 42, d: 100 }, e: 200 } };
        let paths = ['a.b.c', 'a.e'];
        let res = omitByPaths(o, paths);
        expect(res).to.be.deep.equal({ a: { b: { d: 100 } } });
    });

    it('should handle empty paths', () => {
        let o = { a: { b: { c: 42 } } };
        let paths = [];
        let res = omitByPaths(o, paths);
        expect(res).to.be.deep.equal({ a: { b: { c: 42 } } });
    });
});
