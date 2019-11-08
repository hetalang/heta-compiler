/* global describe, it */
const { Page } = require('../../src/core/page');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for Page', () => {

  it('Incorrect content property', () => {
    expect(() => {
      (new Page({id: 'pg1'})).merge({content: {}});
    }).to.throw(ValidationError);
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

    expect(simple.toQ()).to.be.deep.equal({
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
