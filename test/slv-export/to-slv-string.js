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
  it('toSLVString("operator") for "nthRoot(x)"', () => {
    let expr = Expression.fromString('nthRoot(x)');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ (1 / 2)');
  });
  it('toSLVString("function") for "nthRoot(x)"', () => {
    let expr = Expression.fromString('nthRoot(x)');
    expect(expr.toSLVString('function')).to.be.equal('pow(x, 1 / 2)');
  });
  it('toSLVString("operator") for "nthRoot(x, n)"', () => {
    let expr = Expression.fromString('nthRoot(x, n)');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ (1 / n)');
  });
  it('toSLVString("function") for "nthRoot(x, n)"', () => {
    let expr = Expression.fromString('nthRoot(x, n)');
    expect(expr.toSLVString('function')).to.be.equal('pow(x, 1 / n)');
  });
  it('Wrong powTransform', () => {
    let expr = Expression.fromString('pow(a, b)');
    expect(() => expr.toSLVString('xxx')).Throw(TypeError);
  });
});

describe('Ternary operator in DBSolve', () => {
  it('toSLVString("x > y ? y1 : y2")', () => {
    let expr = Expression.fromString('x > y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifgt(x, y, y1, y2)');
  });
  it('toSLVString("x >= y ? y1 : y2")', () => {
    let expr = Expression.fromString('x >= y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifge(x, y, y1, y2)');
  });
  it('toSLVString("x < y ? y1 : y2")', () => {
    let expr = Expression.fromString('x < y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('iflt(x, y, y1, y2)');
  });
  it('toSLVString("x <= y ? y1 : y2")', () => {
    let expr = Expression.fromString('x <= y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifle(x, y, y1, y2)');
  });
  it('toSLVString("x == y ? y1 : y2")', () => {
    let expr = Expression.fromString('x == y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifeq(x, y, y1, y2)');
  });
  it('toSLVString("x != y ? y1 : y2")', () => {
    let expr = Expression.fromString('x != y ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifeq(x, y, y2, y1)');
  });
  it('toSLVString("true ? y1 : y2")', () => {
    let expr = Expression.fromString('true ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifgt(1, 0, y1, y2)');
  });
  it('toSLVString("false ? y1 : y2")', () => {
    let expr = Expression.fromString('false ? y1 : y2');
    expect(expr.toSLVString()).to.be.equal('ifgt(0, 1, y1, y2)');
  });
});


describe('Pre-defined constants in toSLVString()', () => {
  it('toSLVString("e*12")', () => {
    let expr = Expression.fromString('e*12');
    expect(expr.toSLVString()).to.be.equal('exp(1) * 12');
  });
  it('toSLVString("x*pi")', () => {
    let expr = Expression.fromString('x*pi');
    expect(expr.toSLVString()).to.be.equal('x * acos(-1)');
  });
});