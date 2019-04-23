/* global describe, it */
const { _Simple } = require('../../src/core/_simple');
const { SchemaValidationError } = require('../../src/heta-error');
const should = require('chai').should();

describe('Unit test for _Simple common methods', () => {

  it('Check static methods', () => {
    _Simple.should.has.property('schemaName', '_SimpleP');
    _Simple.should.has.property('isValid');
  });

  it('Create empty _Simple', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.should.has.property('className', '_Simple');
    simple.should.has.property('id', 'ref1');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.merge({});
    simple.should.has.property('id', 'ref1');
  });

  it('Title property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({title: 'This is correct title.'});
    simple.should.has.property('title').with.a('string');
  });

  it('Incorrect title property', () => {
    should.Throw(() => {
      (new _Simple({id: 'ref1'})).merge({title: {}});
    }, SchemaValidationError);
  });

  it('Tags property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({tags: ['a', 'b']});
    simple.should.has.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    should.Throw(() => {
      (new _Simple({id: 'ref1'})).merge({tags: {}});
    }, SchemaValidationError);
  });

  it('Incorrect tags property 2', () => {
    should.Throw(() => {
      (new _Simple({id: 'ref1'})).merge({tags: [{}]});
    }, SchemaValidationError);
  });

  it('Aux property', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({aux: {a: 'a', b: 1, c: []}});
    simple.should.has.property('aux');
  });

  it('Incorrect aux property', () => {
    should.Throw(() => {
      (new _Simple({id: 'ref1'})).merge({aux: []});
    }, SchemaValidationError);
  });

  it('Notes property', () => {
    let simple = new _Simple({id: 'ref1'});
    simple.should.not.has.property('notes');
    simple.merge({notes: 'This is correct **note**.'});
    simple.should.has.property('notes');
    simple.should.has.property('notesMdTree').with.instanceOf(Array);
    simple.should.has.property('notesHTML').with.a('string');
  });

  it('Do not merge unknown properties', () => {
    let simple = (new _Simple({id: 'ref1'}))
      .merge({title: 'This is title', prop: 'property', id: 'xxx', space: 'yyy'});
    simple.should.has.property('title');
    simple.should.not.has.property('prop');
    simple.should.has.property('id', 'ref1');
  });

  it('ToQ transformation', () => {
    let simple = (new _Simple({id: 'pmid'})).merge({
      id: 'pmid2',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple.toQ().should.be.deep.equal({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: '_Simple'
    });
  });

});
