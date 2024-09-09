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
  it('Wrong prop type.', () => {
    expect(() => {
      let b = new Builder({id: 'test', notes: 1.1, options: {logLevel: 'panic'}});
    }).to.throw();
    //expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
});
