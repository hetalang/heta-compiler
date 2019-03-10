/* global describe, it */
const { _Simple } = require('../src/core/_simple');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for _Simple common methods', () => {

  it('Check static methods', () => {
    _Simple.should.has.property('schemaName', '_Simple');
    _Simple.should.has.property('isValid');
  });

  it('Create empty _Simple', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.should.has.property('className', '_Simple');
    simple.should.has.property('id', 'ref1');
    simple.should.has.property('space', 'global__');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.merge({});
    simple.should.has.property('id', 'ref1');
    simple.should.has.property('space', 'global__');
  });

  it('Title property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({title: 'This is correct title.'});
    simple.should.has.property('title').with.be.ok();
  });

  it('Incorrect title property', () => {
    should.throws(() => {
      (new _Simple({id: 'ref1'})).merge({title: {}});
    });
  });

  it('Tags property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({tags: ['a', 'b']});
    simple.should.has.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    should.throws(() => {
      (new _Simple({id: 'ref1'})).merge({tags: {}});
    });
  });

  it('Incorrect tags property 2', () => {
    should.throws(() => {
      (new _Simple({id: 'ref1'})).merge({tags: [{}]});
    });
  });

  it('Aux property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({aux: {a: 'a', b: 1, c: []}});
    simple.should.has.property('aux');
  });

  it('Incorrect aux property', () => {
    should.throws(() => {
      (new _Simple({id: 'ref1'})).merge({aux: []});
    });
  });

  it('Notes property', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.should.not.has.property('notes');
    simple.merge({notes: 'This is correct **note**.'});
    simple.should.has.property('notes');
    simple.should.has.property('notesMdTree').with.instanceOf(Array);
    simple.should.has.property('notesHTML').with.instanceOf(String);
  });

  it('Do not merge unknown properties', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({title: 'This is title', prop: 'property', id: 'xxx', space: 'yyy'});
    simple.should.has.property('title');
    simple.should.not.has.property('prop');
    simple.should.has.property('id', 'ref1');
    simple.should.has.property('space', 'global__');
  });

  it('ToQ transformation', () => {
    let simple = (new _Simple({id: 'pmid'})).merge({
      id: 'pmid2',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple.toQ().should.be.deepEqual({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: '_Simple'
    });
  });

});