/* global describe, it */
const { ReferenceDefinition } = require('../../src/core/reference-definition');
const { ValidationError } = require('../../src/heta-error');
const { expect } = require('chai');

describe('Unit test for ReferenceDefinition', () => {

  it('Incorrect prefix property', () => {
    let refDef1 = (new ReferenceDefinition).merge({prefix: {}});
    expect(refDef1.logger).to.has.property('hasErrors', true);
  });

  it('Incorrect suffix property', () => {
    let refDef1 = (new ReferenceDefinition).merge({suffix: {}});
    expect(refDef1.logger).to.has.property('hasErrors', true);
  });

  it('ToQ transformation', () => {
    let simple = (new ReferenceDefinition).merge({
      id: 'pmid',
      title: 'title',
      notes: 'notes',
      tags: ['a', 'b', 'c'],
      aux: {a: 1, b: 'b', c: {}},
      suffix: '-suffix',
      prefix: 'this://is.correct/prefix/'
    });
    simple._id = 'ref1';

    expect(simple.logger).to.has.property('hasErrors', false);
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
