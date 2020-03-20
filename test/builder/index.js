/* global describe, it */
const { Builder, BuilderError } = require('../../src/builder');
const declaration = require('./test-platform');
const { expect } = require('chai');

describe('Test Builder.', () => {
  let b;
  it('Create Builder object and run.', () => {
    b = new Builder(declaration, __dirname);
    b.run();
  });
});

describe('Errors in declaration.', () => {
  it('Empty declaration throws.', () => {
    expect(() => {
      new Builder({options: {logLevel: 'panic'}});
    }).to.throw(BuilderError);
  });
  it('Wrong prop type.', () => {
    expect(() => {
      new Builder({id: 'test', notes: 1.1, options: {logLevel: 'panic'}});
    }).to.throw(BuilderError);
  });
  it('Wrong version format.', () => {
    expect(() => {
      new Builder({id: 'test', builderVersion: '0.100.0', options: {logLevel: -1}});
    }).to.throw(BuilderError);
  });
});
