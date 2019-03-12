/* global describe, it */

const { Storage } = require('../src/storage');
const should = require('chai').should();

describe('Unit tests for Storage', () => {
  var s;

  it('Creating empty storage.', () => {
    s = new Storage();
  });
});
