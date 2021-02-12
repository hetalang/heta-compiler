/*global describe, it*/
const { expect } = require('chai');
const { Expression } = require('../../src/core/expression');

describe('Test dependOnObj()', () => {
  it('Simple expression', () => {
    let expr = Expression.fromString('pi*x*y*z*e');
    let deps = expr.dependOnNodes();
    expect(deps).to.be.lengthOf(3);
    deps.forEach((node) => {
      expect(node).to.have.property('name').a('string');
    });
  });
  it('Expression with repeats', () => {
    let expr = Expression.fromString('pi*x*x*x*e');
    let deps = expr.dependOnNodes();
    expect(deps).to.be.lengthOf(3);
    deps.forEach((node) => {
      expect(node).to.have.property('name').a('string');
    });
  });
  it('include functions', () => {
    let expr = Expression.fromString('1*2*x*y(z1*z2)');
    let deps = expr.dependOnNodes();
    expect(deps).to.be.lengthOf(3);
    deps.forEach((node) => {
      expect(node).to.have.property('name').a('string');
    });
  });
});
