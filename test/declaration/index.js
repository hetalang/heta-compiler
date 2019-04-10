/* global describe, it */
const Declaration = require('../../src/declaration');
const declarationArg = require('./test-platform');
const { expect } = require('chai');
const { SchemaValidationError } = require('../../src/validation-error');

describe('Test declaration format.', () => {
  let d;
  it('Create Declaration object.', () => {
    d = new Declaration(declarationArg, '.');
    console.log(d);
  });
  it('Run without errors.', () => {
    d.run((err) => {
      expect(err).to.be.null;
    });
  });
});

describe('Errors in declaration.', () => {
  it('Empty declaration throws.', () => {
    expect(() => {
      new Declaration({});
    }).to.throw(SchemaValidationError);
  });
  it('Wrong prop type.', () => {
    expect(() => {
      new Declaration({id: 'test', notes: 1.1});
    }).to.throw(SchemaValidationError);
  });
  it('Wrong version format.', () => {
    expect(() => {
      new Declaration({id: 'test', builderVersion: '0.4.0'});
    }).to.throw(Error);
  });
});
