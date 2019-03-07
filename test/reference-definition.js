/* global describe, it, should */
const { ReferenceDefinition } = require('../src/core/reference-definition');

describe('Unit test for _Simple common methods', () => {

  it('Check static methods', () => {
    ReferenceDefinition.should.has.property('schemaName', 'ReferenceDefinitionP');
    ReferenceDefinition.should.has.property('isValid');
  });

  it('Create empty ReferenceDefinition', () => {
    let simple = new ReferenceDefinition();
    simple.should.has.property('className', 'ReferenceDefinition');
    simple.should.has.property('index');
    simple.should.has.property('indexString');
    simple.should.has.property('clone');
  });

  it('Merge with empty', () => {
    let simple = new ReferenceDefinition;
    simple.merge({});
  });

  it('Title property', () => {
    let simple = (new ReferenceDefinition)
      .merge({title: 'This is correct title.'});
    simple.should.has.property('title').with.be.ok();
  });

  it('Incorrect title property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({title: {}});
    });
  });

  it('Tags property', () => {
    let simple = (new ReferenceDefinition)
      .merge({tags: ['a', 'b']});
    simple.should.has.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({tags: {}});
    });
  });

  it('Incorrect tags property 2', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({tags: [{}]});
    });
  });

  it('Aux property', () => {
    let simple = (new ReferenceDefinition)
      .merge({aux: {a: 'a', b: 1, c: []}});
    simple.should.has.property('aux');
  });

  it('Incorrect aux property', () => {
    should.throws(() => {
      (new ReferenceDefinition).merge({aux: []});
    });
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
    simple.should.not.has.property('id');
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
      // id: 'pmid', // id is not stored in current version
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: 'ReferenceDefinition'
    });
  });

});

describe('Unit test for ReferenceDefinition', () => {

});
