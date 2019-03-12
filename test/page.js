/* global describe, it, should */
const { Page } = require('../src/core/page');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('chai').should();

describe('Unit test for Page', () => {

  it('Incorrect content property', () => {
    should.Throw(() => {
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

    simple.toQ().should.be.deep.equal({
      id: 'pg1',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      content: 'content',
      class: 'Page'
    });
  });

});
