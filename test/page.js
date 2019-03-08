/* global describe, it, should */
const { Page } = require('../src/core/page');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for _Scoped common methods', () => {

  it('Check static methods', () => {
    Page.should.has.property('schemaName', 'PageP');
    Page.should.has.property('isValid');
  });

  it('Create empty Page', () => {
    let simple = new Page();
    simple.should.has.property('className', 'Page');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new Page;
    simple.merge({});
    simple.should.not.has.property('id');
    simple.should.has.property('space', 'default__');
  });

  it('ToQ transformation', () => {
    let simple = (new Page).merge({
      id: 'pg1',
      space: 'one',
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
      class: 'Page'
    });
  });

});

describe('Unit test for Page', () => {

  it('Incorrect content property', () => {
    should.throws(() => {
      (new Page).merge({content: {}});
    });
  });

  it('ToQ transformation', () => {
    let simple = (new Page).merge({
      id: 'pmid',
      space: 'one',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      content: 'content',
      aux: {a: 1, b: 'b', c: {}}
    });

    simple.toQ().should.be.deepEqual({
      id: 'pmid',
      space: 'one',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      content: 'content',
      class: 'Page'
    });
  });

});
