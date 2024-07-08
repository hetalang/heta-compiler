// test creation of components with properties set with null

/* global describe, it */
const { Record } = require('../../src/core/record');
const { expect } = require('chai');

describe('Unit tests for null properties.', () => {
    it('Set all null properties', () => {
        let rec = (new Record).merge({
            title: null,
            notes: null,
            assignments: {start_: null, ode_: null, xxx: null},
            tags: null,
            aux: null
        });
        rec._id = 'x1';

        expect(rec.toQ()).to.be.deep.equal({
            class: 'Record',
            id: 'x1',
            assignments: {}
        });
    });

    it('Set all properties, than delete by null', () => {
        let rec = (new Record).merge({
            title: 'Title',
            notes: 'Notes',
            units: 'mm',
            assignments: {start_: 'start', ode_: 'ode', xxx: 'xxx'},
            tags: ['tag1', 'tag2'],
            aux: {a: 1, b: 2}
        });
        rec._id = 'x1';

        rec.merge({
            title: null,
            notes: null,
            units: null,
            assignments: {start_: null, ode_: null, xxx: null},
            tags: null,
            aux: null
        });

        expect(rec.toQ()).to.be.deep.equal({
            class: 'Record',
            id: 'x1',
            assignments: {}
        });
    });
});