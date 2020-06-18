/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/dbsolve-export/expression');
const { expect } = require('chai');

describe('Expession exports to SLV', () => {

  it('toSLVString("keep") for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromString('pow(x, y) + x^y');
    expect(expr.toSLVString('keep')).to.be.equal('pow(x, y) + x ^ y');
  });
  it('toSLVString("function") for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromString('pow(x, y) + x^y');
    expect(expr.toSLVString('function')).to.be.equal('pow(x, y) + pow(x, y)');
  });
  it('toSLVString("operator") for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromString('pow(x, y) + x^y');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ y + x ^ y');
  });
  it('toSLVString("operator") for "pow(x, y+z)"', () => {
    let expr = Expression.fromString('pow(x, y+z)');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ (y + z)');
  });
  it('toSLVString("operator") for "pow(-1, n)"', () => {
    let expr = Expression.fromString('pow(-1, n)');
    expect(expr.toSLVString('operator')).to.be.equal('(-1) ^ n');
  });
  it('toSLVString("operator") for "pow(n, -1/2)"', () => {
    let expr = Expression.fromString('pow(n, -1/2)');
    expect(expr.toSLVString('operator')).to.be.equal('n ^ (-1 / 2)');
  });
  it('Wrong powTransform', () => {
    let expr = Expression.fromString('pow(a, b)');
    expect(() => expr.toSLVString('xxx')).Throw(TypeError);
  });

});