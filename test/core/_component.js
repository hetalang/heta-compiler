/* global describe, it */
const { Component } = require('../../src/core/component');
const { expect } = require('chai');

describe('Unit test for Component common methods', () => {

  it('Check static methods', () => {
    expect(Component).to.have.property('schemaName', 'Component');
    expect(Component).to.have.property('isValid');
  });

  it('Create empty Component', () => {
    let simple = new Component;
    simple._id = 'ref1';
    expect(simple).to.have.property('className', 'Component');
    expect(simple).to.have.property('id', 'ref1');
    expect(simple).to.have.property('index');
    expect(simple).to.have.property('space', undefined);
    expect(simple).to.have.property('merge');
  });

  it('Create empty scoped Component', () => {
    let simple = new Component;
    simple._id = 'pg1';
    expect(simple).to.have.property('className', 'Component');
    expect(simple).to.have.property('id', 'pg1');
    expect(simple).to.have.property('index');
    expect(simple).to.have.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new Component;
    simple._id = 'ref1';
    simple.merge({});
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple).to.have.property('id', 'ref1');
  });

  it('Title property', () => {
    let simple = (new Component).merge({
      title: 'This is correct title.'
    });
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple).to.have.property('title').with.a('string');
  });

  it('Incorrect title property', () => {
    let simple = (new Component).merge({title: {}});
    //expect(simple.logger).to.has.property('hasErrors', true);
  });

  it('Tags property', () => {
    let simple = (new Component).merge({
      tags: ['a', 'b']
    });
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple).to.have.property('tags').with.instanceOf(Array);
  });

  it('Incorrect tags property 1', () => {
    let simple = (new Component).merge({
      tags: {}
    });
    //expect(simple.logger).to.has.property('hasErrors', true);
  });

  it('Incorrect tags property 2', () => {
    let simple = (new Component).merge({
      tags: [{}]
    });
    //expect(simple.logger).to.has.property('hasErrors', true);
  });

  it('Aux property', () => {
    let simple = (new Component).merge({
      aux: {a: 'a', b: 1, c: []}
    });
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple).to.have.property('aux');
  });

  it('Incorrect aux property', () => {
    let simple = (new Component).merge({
      aux: []
    });
    //expect(simple.logger).to.has.property('hasErrors', true);
  });

  it('Notes property', () => {
    let simple = new Component;
    expect(simple).not.to.have.property('notes');
    simple.merge({
      notes: 'This is correct **note**.'
    });
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple).to.have.property('notes');
    expect(simple).to.have.property('notesHTML').with.a('string');
  });

  it('Do not merge unknown properties', () => {
    let simple = (new Component).merge({
      title: 'This is title', 
      prop: 'property', 
      id: 'xxx', 
      space: 'yyy'
    });
    //expect(simple.logger).to.has.property('hasErrors', false);
    simple._id = 'ref1';
    expect(simple).to.have.property('title');
    expect(simple).not.to.have.property('prop');
    expect(simple).to.have.property('id', 'ref1');
  });

  it('ToQ transformation', () => {
    let simple = (new Component).merge({
      id: 'pmid2',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple._id = 'pmid';

    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple.toQ()).to.be.deep.equal({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: 'Component'
    });
  });

  it('ToQ transformation', () => {
    let simple = (new Component).merge({
      id: 'pg2',
      space: 'two',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}}
    });
    simple._id ='pg1';
    
    //expect(simple.logger).to.has.property('hasErrors', false);
    expect(simple.toQ()).to.be.deep.equal({
      id: 'pg1',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      class: 'Component'
    });
  });
});
