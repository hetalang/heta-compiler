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
    let simple = new Page({id: 'pg1', space: 'one'});
    simple.should.has.property('className', 'Page');
    simple.should.has.property('id', 'pg1');
    simple.should.has.property('space', 'one');
    simple.should.has.property('index');
    simple.should.has.property('clone');
    simple.should.has.property('merge');
  });

  it('Merge with empty', () => {
    let simple = new Page({id: 'pg1'});
    simple.merge({});
    simple.should.has.property('id', 'pg1');
    simple.should.has.property('space', 'default__');
  });

  it('No id and space throws.', () => {
    should.throws(() => {
      new Page;
    });
  });

  it('No id throws.', () => {
    should.throws(() => {
      new Page({space: 'one'});
    });
  });

  it('ToQ transformation', () => {
    let simple = (new Page({id: 'pg1', space: 'one'})).merge({
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
      class: 'Page'
    });
  });

});

describe('Unit test for Page', () => {

  it('Incorrect content property', () => {
    should.throws(() => {
      (new Page({id: 'pg1'})).merge({content: {}});
    });
  });

  it('ToQ transformation', () => {
    let simple = (new Page({id: 'pg1'})).merge({
      id: 'pmid',
      space: 'one',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      content: 'content',
      aux: {a: 1, b: 'b', c: {}}
    });

    simple.toQ().should.be.deepEqual({
      id: 'pg1',
      space: 'default__',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      content: 'content',
      class: 'Page'
    });
  });

});
