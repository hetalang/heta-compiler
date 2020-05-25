/* global describe, it */
const { Page } = require('../../src/core/page');
const { expect } = require('chai');

describe('Unit test for Page', () => {

  it('Incorrect content property', () => {
    let page1 = (new Page).merge({content: {}});
    //expect(page1.logger).to.has.property('hasErrors', true);
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
    simple._id = 'pg1';

    //expect(simple.logger).to.has.property('hasErrors', false);
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
