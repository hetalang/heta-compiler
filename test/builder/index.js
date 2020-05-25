/* global describe, it */
const { Builder } = require('../../src/builder');
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
    let b = new Builder({options: {logLevel: 'panic'}});
    expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
  it('Wrong prop type.', () => {
    let b = new Builder({id: 'test', notes: 1.1, options: {logLevel: 'panic'}});
    expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
  it('Wrong version format.', () => {
    let b = new Builder({id: 'test', builderVersion: '0.100.0', options: {logLevel: 'panic'}});
    expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
});
