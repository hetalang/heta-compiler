/* global describe, it */
const { Builder, BuilderError } = require('../../src/builder');
const declaration = require('./test-platform');
const { expect } = require('chai');

describe('Test Builder.', () => {
  let b;
  it('Create Builder object.', () => {
    b = new Builder(declaration, '.');
  });
  it('Run without errors.', () => {
    //b.run((err) => {
    //  expect(err).to.be.null;
    //});
  });
});

describe('Errors in declaration.', () => {
  it('Empty declaration throws.', () => {
    expect(() => {
      new Builder({});
    }).to.throw(BuilderError);
  });
  it('Wrong prop type.', () => {
    expect(() => {
      new Builder({id: 'test', notes: 1.1});
    }).to.throw(BuilderError);
  });
  it('Wrong version format.', () => {
    expect(() => {
      new Builder({id: 'test', builderVersion: '0.100.0', options: {logLevel: -1}});
    }).to.throw(BuilderError);
  });
});
