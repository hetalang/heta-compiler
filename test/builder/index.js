/* global describe, it */
const { Builder } = require('../../src/builder');
const declaration = require('./test-platform');
const { expect } = require('chai');
const fs = require('fs-extra');

describe('Test Builder.', () => {
  let b;
  it('Create Builder object and run.', () => {
    process.chdir(__dirname);
    b = new Builder(declaration, fs.readFileSync, () => {});
    b.run();
    process.chdir('../..');
  });
});

describe('Errors in declaration.', () => {
  it('Wrong prop type.', () => {
    expect(() => {
      let b = new Builder({id: 'test', notes: 1.1, options: {}});
    }).to.throw();
    //expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
});
