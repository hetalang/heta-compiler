/*global describe, it*/
const { expect } = require('chai');
const { Expression } = require('../../src/core/expression');

describe('Expression constructor.', () => {
  it('No argument throws.', () => {
    expect(() => {
      let expr = Expression.fromString();
    }).throw(TypeError);
  });
  it('Empty argument throws', () => {
    expect(() => {
      let expr = Expression.fromString({});
    }).throw(TypeError);
  });
  it('mc^2', () => {
    let expr = Expression.fromString('m*c^2');
    expect(expr.toString()).to.be.equal('m * c ^ 2');
    expect(expr.toString()).to.be.deep.equal('m * c ^ 2');
  });
  it('Bad expression string throws.', () => {
    expect(() => {
      let expr = Expression.fromString('e*(m');
    }).throw(TypeError);
  });
});
