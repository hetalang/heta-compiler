/* global describe, it */
const { ReferenceDefinition } = require('../src/core/reference-definition');
const { SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for ReferenceDefinition', () => {

  it('Incorrect prefix property', () => {
    should.throws(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({prefix: {}});
    });
  });

  it('Incorrect suffix property', () => {
    should.throws(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({suffix: {}});
    });
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

    simple.toQ().should.be.deepEqual({
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
