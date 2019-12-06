/* global describe, it */

const { expect } = require('chai');
const { flatten } = require('../src/core/utilities');

let test = {
  aux: {x: [1,2,3], y: {a: 1, b: 1}},
  a: [1,2,3],
  b: [{},{},{}],
  c: true,
  d: {x: {x: {x: 1}}, y: 2, z: {}},
  e: []
};

let result = {
  'aux.x[]': '1; 2; 3',
  'aux.y.a': 1,
  'aux.y.b': 1,
  'a[]': '1; 2; 3',
  'b[]': '{}; {}; {}',
  'c': true,
  'd.x.x.x': 1,
  'd.y': 2,
  'e[]': ''
};

describe('test flatten()', () => {
  it('complex object', () => {
    let res = flatten(test);
    expect(res).to.be.deep.equal(result);
  });
});
