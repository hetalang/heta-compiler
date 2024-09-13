// Throw errors when null is not allowed as value

/* global describe, it */

const { Record } = require('../../src/core/record');
const { FunctionDef } = require('../../src/core/function-def');
const { UnitDef } = require('../../src/core/unit-def');
const { expect } = require('chai');

describe('Unit tests for wrong null properties.', () => {
    it('Set null for aux subproperties', () => {
        let rec = (new Record).merge({
            aux: {a: 1, b: 2, c: null}
        });
        rec._id = 'x1';

        // in current version of API is hard to check if there are errors at validation
        // we use only checking of empty aux
        expect(rec.aux).to.be.deep.equal({});
    });

    it('Set null for tags', () => {
        let rec = (new Record).merge({
            tags: ['eee', 'ttt', null]
        });
        rec._id = 'x1';

        // this is also result of error in validation
        expect(rec.tags).to.be.deep.equal([]);
    });

    it('Cannot set null for math FunctionDef', () => {
        let fd = new FunctionDef().merge({
            id: 'f1',
            math: null
        });

        expect(fd.errored).to.be.true;
    });

    it('Cannot set null for arguments FunctionDef 1', () => {
        let fd = new FunctionDef().merge({
            id: 'f1',
            arguments: null,
            math: '15'
        });

        expect(fd.errored).to.be.true;
    });

    it('Cannot set null for arguments FunctionDef 2', () => {
        let fd = new FunctionDef().merge({
            id: 'f1',
            arguments: [null, 'x1', 'x2'],
            math: 'x1 + x2'
        });

        expect(fd.errored).to.be.true;
    });

    it('Cannot set null for units UnitDef', () => {
        let ud = new UnitDef().merge({
            id: 'u1',
            units: null
        });

        expect(ud.errored).to.be.true;
    });
});
