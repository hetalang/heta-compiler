/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/julia-export/expression');
const { expect } = require('chai');

describe('Expession exports to Julia', () => {
  it('toJuliaString() for "abs(-1/2)"', () => {
    let expr = Expression.fromQ('abs(-1/2)');
    expect(expr.toJuliaString()).to.be.equal('abs(-1.0 / 2.0)');
  });
  it('toJuliaString() for "x*y"', () => {
    let expr = Expression.fromQ('x*y');
    expect(expr.toJuliaString()).to.be.equal('x * y');
  });
  it('toJuliaString() for "plus(x,y)"', () => {
    let expr = Expression.fromQ('plus(x,y)');
    expect(expr.toJuliaString()).to.be.equal('+(x, y)');
  });
  it('toJuliaString() for 1.1', () => {
    let expr = Expression.fromQ(1.1);
    expect(expr.toJuliaString()).to.be.equal('1.1');
  });
  it('toJuliaString() for 0', () => {
    let expr = Expression.fromQ(0);
    expect(expr.toJuliaString()).to.be.equal('0.0');
  });
  it('toJuliaString() for -1', () => {
    let expr = Expression.fromQ(-1);
    expect(expr.toJuliaString()).to.be.equal('-1.0');
  });
  it('toJuliaString() for "x*(1+2.2)/3"', () => {
    let expr = Expression.fromQ('x*(1+2.2)/3');
    expect(expr.toJuliaString()).to.be.equal('x * (1.0 + 2.2) / 3.0');
  });
  it('toJuliaString() for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromQ('pow(x, y) + x^y');
    expect(expr.toJuliaString()).to.be.equal('^(x, y) + x ^ y');
  });
  it('toJuliaString() for "max(1, 2, 3) + min(1, 2, 3)"', () => {
    let expr = Expression.fromQ('max(1, 2, 3) + min(1, 2, 3)');
    expect(expr.toJuliaString()).to.be.equal('max(1.0, 2.0, 3.0) + min(1.0, 2.0, 3.0)');
  });
  it('toJuliaString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromQ('exp(-kel*t)');
    expect(expr.toJuliaString()).to.be.equal('exp(-kel * t)');
  });
  it('toJuliaString() for "ln(x*y)"', () => {
    let expr = Expression.fromQ('ln(x*y)');
    expect(expr.toJuliaString()).to.be.equal('log(x * y)');
  });
  it('toJuliaString() for "log(exp(1))"', () => {
    let expr = Expression.fromQ('log(exp(1))');
    expect(expr.toJuliaString()).to.be.equal('log(exp(1.0))');
  });
  it('toJuliaString() for "log(8, 2)"', () => {
    let expr = Expression.fromQ('log(8, 2)');
    expect(expr.toJuliaString()).to.be.equal('log(2.0, 8.0)');
  });
  it('toJuliaString() for "log10(100)"', () => {
    let expr = Expression.fromQ('log10(100)');
    expect(expr.toJuliaString()).to.be.equal('log10(100.0)');
  });
  it('toJuliaString() for "ifg0(x-y, 1,2)"', () => {
    let expr = Expression.fromQ('ifg0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y > 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "ife0(x-y, 1,2)"', () => {
    let expr = Expression.fromQ('ife0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y == 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "ifge0(x-y, 1,2)"', () => {
    let expr = Expression.fromQ('ifge0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y >= 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "factorial(x*y)"', () => {
    let expr = Expression.fromQ('factorial(x*y)');
    expect(expr.toJuliaString()).to.be.equal('factorial(ceil(Int, x * y))');
  });
  it('toJuliaString() for "ceil(x*y)"', () => {
    let expr = Expression.fromQ('ceil(x*y)');
    expect(expr.toJuliaString()).to.be.equal('ceil(x * y)');
  });
});
