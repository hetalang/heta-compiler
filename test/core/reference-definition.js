/* global describe, it */
const { ReferenceDefinition } = require('../../src/core/reference-definition');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for ReferenceDefinition', () => {

  it('Incorrect prefix property', () => {
    expect(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({prefix: {}});
    }).to.throw(ValidationError);
  });

  it('Incorrect suffix property', () => {
    expect(() => {
      (new ReferenceDefinition({id: 'ref1'})).merge({suffix: {}});
    }).to.throw(ValidationError);
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

    expect(simple.toQ()).to.be.deep.equal({
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
