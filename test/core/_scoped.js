/* global describe, it */
const { _Scoped } = require('../../src/core/_scoped');
const { ConstructValidationError } = require('../../src/validation-error');
const should = require('chai').should();

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
    let simple = new _Scoped({id: 'pg1', space: 'default__'});
    simple.merge({});
    simple.should.has.property('id', 'pg1');
    simple.should.has.property('space', 'default__');
  });

  it('No id and space throws.', () => {
    should.Throw(() => {
      new _Scoped;
    }, ConstructValidationError);
  });

  it('No id throws.', () => {
    should.Throw(() => {
      new _Scoped({space: 'one'});
    }, ConstructValidationError);
  });

  it('No space throws.', () => {
    should.Throw(() => {
      new _Scoped({id: 'one'});
    }, ConstructValidationError);
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
    simple.toQ().should.be.deep.equal({
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
