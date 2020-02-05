/* global describe, it */
const { _Component } = require('../../src/core/_component');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for _Component common methods', () => {

  it('Check static methods', () => {
    expect(_Component).to.have.property('schemaName', '_ComponentP');
    expect(_Component).to.have.property('isValid');
  });

  it('Create empty _Component', () => {
    let simple = new _Component;
    simple._id = 'ref1';
    expect(simple).to.have.property('className', '_Component');
    expect(simple).to.have.property('id', 'ref1');
    expect(simple).to.have.property('index');
    expect(simple).to.have.property('space', undefined);
    expect(simple).to.have.property('merge');
  });

  it('Create empty scoped _Component', () => {
    let simple = new _Component;
    simple._id = 'pg1';
    expect(simple).to.have.property('className', '_Component');
    expect(simple).to.have.property('id', 'pg1');
    expect(simple).to.have.property('index');
    expect(simple).to.have.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new _Component;
    simple._id = 'ref1';
    simple.merge({});
    expect(simple).to.have.property('id', 'ref1');
  });

  it('Title property', () => {
    let simple = (new _Component)
      .merge({title: 'This is correct title.'});
    expect(simple).to.have.property('title').with.a('string');
  });

  it('Incorrect title property', () => {
    expect(() => {
      (new _Component).merge({title: {}});
    }).to.throw(ValidationError);
  });

  it('Tags property', () => {
    let simple = (new _Component)
      .merge({tags: ['a', 'b']});
    expect(simple).to.have.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    expect(() => {
      (new _Component).merge({tags: {}});
    }).to.throw(ValidationError);
  });

  it('Incorrect tags property 2', () => {
    expect(() => {
      (new _Component).merge({tags: [{}]});
    }).to.throw(ValidationError);
  });

  it('Aux property', () => {
    let simple = (new _Component)
      .merge({aux: {a: 'a', b: 1, c: []}});
    expect(simple).to.have.property('aux');
  });

  it('Incorrect aux property', () => {
    expect(() => {
      (new _Component).merge({aux: []});
    }).to.throw(ValidationError);
  });

  it('Notes property', () => {
    let simple = new _Component;
    expect(simple).not.to.have.property('notes');
    simple.merge({notes: 'This is correct **note**.'});
    expect(simple).to.have.property('notes');
    expect(simple).to.have.property('notesMdTree').with.instanceOf(Array);
    expect(simple).to.have.property('notesHTML').with.a('string');
  });

  it('Do not merge unknown properties', () => {
    let simple = (new _Component)
      .merge({title: 'This is title', prop: 'property', id: 'xxx', space: 'yyy'});
    simple._id = 'ref1';
    expect(simple).to.have.property('title');
    expect(simple).not.to.have.property('prop');
    expect(simple).to.have.property('id', 'ref1');
  });

  it('ToQ transformation', () => {
    let simple = (new _Component).merge({
      id: 'pmid2',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple._id = 'pmid';
    expect(simple.toQ()).to.be.deep.equal({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: '_Component'
    });
  });

  it('ToQ transformation', () => {
    let simple = (new _Component).merge({
      id: 'pg2',
      space: 'two',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple._id ='pg1';
    expect(simple.toQ()).to.be.deep.equal({
      id: 'pg1',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: '_Component'
    });
  });
});
