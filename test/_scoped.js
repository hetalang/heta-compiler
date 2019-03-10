/* global describe, it, should */
const { _Scoped } = require('../src/core/_scoped');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for _Scoped common methods', () => {

  it('Check static methods', () => {
    _Scoped.should.has.property('schemaName', '_ScopedP');
    _Scoped.should.has.property('isValid');
  });

  it('Create empty _Scoped', () => {
    let simple = new _Scoped({id: 'pg1', space: 'one'});
    simple.should.has.property('className', '_Scoped');
    simple.should.has.property('id', 'pg1');
    simple.should.has.property('space', 'one');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new _Scoped({id: 'pg1'});
    simple.merge({});
    simple.should.has.property('id', 'pg1');
    simple.should.has.property('space', 'default__');
  });

  it('No id and space throws.', () => {
    should.throws(() => {
      new _Scoped;
    });
  });

  it('No id throws.', () => {
    should.throws(() => {
      new _Scoped({space: 'one'});
    });
  });

  it('ToQ transformation', () => {
    let simple = (new _Scoped({id: 'pg1', space: 'one'})).merge({
      id: 'pg2',
      space: 'two',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple.toQ().should.be.deepEqual({
      id: 'pg1',
      space: 'one',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: '_Scoped'
    });
  });

});
