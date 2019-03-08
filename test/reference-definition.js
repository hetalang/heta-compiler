/* global describe, it, should */
const { ReferenceDefinition } = require('../src/core/reference-definition');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for _Simple common methods', () => {

  it('Check static methods', () => {
    ReferenceDefinition.should.has.property('schemaName', 'ReferenceDefinitionP');
    ReferenceDefinition.should.has.property('isValid');
  });

  it('Create empty ReferenceDefinition', () => {
    let simple = new ReferenceDefinition();
    simple.should.has.property('className', 'ReferenceDefinition');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new ReferenceDefinition;
    simple.merge({});
    simple.should.not.has.property('id');
    simple.should.not.has.property('space');
  });

  it('Title property', () => {
    let simple = (new ReferenceDefinition)
      .merge({title: 'This is correct title.'});
    simple.should.has.property('title').with.be.ok();
  });

  it('Incorrect title property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({title: {}});
    }, SchemaValidationError);
  });

  it('Tags property', () => {
    let simple = (new ReferenceDefinition)
      .merge({tags: ['a', 'b']});
    simple.should.has.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({tags: {}});
    }, SchemaValidationError);
  });

  it('Incorrect tags property 2', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({tags: [{}]});
    }, SchemaValidationError);
  });

  it('Aux property', () => {
    let simple = (new ReferenceDefinition)
      .merge({aux: {a: 'a', b: 1, c: []}});
    simple.should.has.property('aux');
  });

  it('Incorrect aux property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({aux: []});
    }, SchemaValidationError);
  });

  it('Notes property', () => {
    let simple = new ReferenceDefinition;
    simple.should.not.has.property('notes');
    simple.merge({notes: 'This is correct **note**.'});
    simple.should.has.property('notes');
    simple.should.has.property('notesMdTree').with.instanceOf(Array);
    simple.should.has.property('notesHTML').with.instanceOf(String);
  });

  it('Do not merge unknown properties', () => {
    let simple = (new ReferenceDefinition)
      .merge({title: 'This is title', prop: 'property', id: 'xxx', space: 'yyy'});
    simple.should.has.property('title');
    simple.should.not.has.property('prop');
    simple.should.has.property('id');
    simple.should.not.has.property('space');
  });

  it('ToQ transformation', () => {
    let simple = (new ReferenceDefinition).merge({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple.toQ().should.be.deepEqual({
      id: 'pmid', // TODO: id cannot be merged in current version
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: 'ReferenceDefinition'
    });
  });

});

describe('Unit test for ReferenceDefinition', () => {

  it('Incorrect prefix property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({prefix: {}});
    }, SchemaValidationError);
  });

  it('Incorrect suffix property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({suffix: {}});
    }, SchemaValidationError);
  });

  it('ToQ transformation', () => {
    let simple = (new ReferenceDefinition).merge({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      suffix: '-suffix',
      prefix: 'this://is.correct/prefix/'
    });

    simple.toQ().should.be.deepEqual({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: 'ReferenceDefinition',
      suffix: '-suffix',
      prefix: 'this://is.correct/prefix/'
    });
  });

});
