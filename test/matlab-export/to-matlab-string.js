/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/matlab-export/expression');
const { expect } = require('chai');

describe('Expession exports', () => {

  it('toMatlabString() for "pow(x, y)"', () => {
    let expr = Expression.fromString('pow(x, y)');
    expect(expr.toMatlabString()).to.be.equal('power(x, y)');
  });
  it('toMatlabString() for "max(1, 2, 3)"', () => {
    let expr = Expression.fromString('max(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('max([1, 2, 3])');
  });
  it('toMatlabString() for "min(1, 2, 3)"', () => {
    let expr = Expression.fromString('min(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('min([1, 2, 3])');
  });
  it('toMatlabString() for "log(x)"', () => {
    let expr = Expression.fromString('log(x)');
    expect(expr.toMatlabString()).to.be.equal('log(x)');
  });
  it('toMatlabString() for "log(b, x)"', () => {
    let expr = Expression.fromString('logbase(x, b)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(b))');
  });
  it('toMatlabString() for "log10(x)"', () => {
    let expr = Expression.fromString('log10(x)');
    expect(expr.toMatlabString()).to.be.equal('log10(x)');
  });
  it('toMatlabString() for "log2(x)"', () => {
    let expr = Expression.fromString('log2(x)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(2))');
  });
  it('toMatlabString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromString('exp(-kel*t)');
    expect(expr.toMatlabString()).to.be.equal('exp(-kel * time)');
  });
  it('toMatlabString() for "ln(x)"', () => {
    let expr = Expression.fromString('ln(x)');
    expect(expr.toMatlabString()).to.be.equal('log(x)');
  });
  it('toMatlabString() for "x ^ y ^ z"', () => {
    let expr = Expression.fromString('x ^ y ^ z');
    expect(expr.toMatlabString()).to.be.equal('(x ^ (y ^ z))');
  });
  it('toMatlabString() for "x ^ y * z"', () => {
    let expr = Expression.fromString('x ^ y * z');
    expect(expr.toMatlabString()).to.be.equal('(x ^ y) * z');
  });
  it('toMatlabString() for "z * x ^ y"', () => {
    let expr = Expression.fromString('z * x ^ y');
    expect(expr.toMatlabString()).to.be.equal('z * (x ^ y)');
  });
});
