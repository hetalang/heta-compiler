/* global describe, it */
const { ReferenceDefinition } = require('../../src/core/reference-definition');
const { ValidationError } = require('../../src/heta-error');
const should = require('chai').should();

describe('Unit test for ReferenceDefinition', () => {

  it('Incorrect prefix property', () => {
    should.Throw(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({prefix: {}});
    }, ValidationError);
  });

  it('Incorrect suffix property', () => {
    should.Throw(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({suffix: {}});
    }, ValidationError);
  });

  it('ToQ transformation', () => {
    let simple = (new ReferenceDefinition({id: 'ref1'})).merge({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      suffix: '-suffix',
      prefix: 'this://is.correct/prefix/'
    });

    simple.toQ().should.be.deep.equal({
      id: 'ref1',
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
