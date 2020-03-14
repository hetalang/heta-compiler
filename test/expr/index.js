/*global describe, it*/
const { expect } = require('chai');
const { Expression } = require('../../src/core/expression');

describe('Expression constructor.', () => {
  it('No argument throws.', () => {
    expect(() => {
      let expr = Expression.fromQ();
    }).throw(TypeError);
  });
  it('Empty argument throws', () => {
    expect(() => {
      let expr = Expression.fromQ({});
    }).throw(TypeError);
  });
  it('mc^2', () => {
    let expr = Expression.fromQ('m*c^2');
    expect(expr.expr).to.be.equal('m * c ^ 2');
    expect(expr.toQ()).to.be.deep.equal('m * c ^ 2');
  });
  it('Bad expression string throws.', () => {
    expect(() => {
      let expr = Expression.fromQ('e*(m');
    }).throw(TypeError);
  });
});
