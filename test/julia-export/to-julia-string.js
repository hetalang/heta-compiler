/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/julia-export/expression');
const { expect } = require('chai');

describe('Expession exports to Julia', () => {
  it('toJuliaString() for "abs(-1/2)"', () => {
    let expr = Expression.fromString('abs(-1/2)');
    expect(expr.toJuliaString()).to.be.equal('abs(-1.0 / 2.0)');
  });
  it('toJuliaString() for "x*y"', () => {
    let expr = Expression.fromString('x*y');
    expect(expr.toJuliaString()).to.be.equal('x * y');
  });
  it('toJuliaString() for "plus(x,y)"', () => {
    let expr = Expression.fromString('plus(x,y)');
    expect(expr.toJuliaString()).to.be.equal('+(x, y)');
  });
  it('toJuliaString() for 1.1', () => {
    let expr = Expression.fromString(1.1);
    expect(expr.toJuliaString()).to.be.equal('1.1');
  });
  it('toJuliaString() for 0', () => {
    let expr = Expression.fromString(0);
    expect(expr.toJuliaString()).to.be.equal('0.0');
  });
  it('toJuliaString() for -1', () => {
    let expr = Expression.fromString(-1);
    expect(expr.toJuliaString()).to.be.equal('-1.0');
  });
  it('toJuliaString() for "x*(1+2.2)/3"', () => {
    let expr = Expression.fromString('x*(1+2.2)/3');
    expect(expr.toJuliaString()).to.be.equal('x * (1.0 + 2.2) / 3.0');
  });
  it('toJuliaString() for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromString('pow(x, y) + x^y');
    expect(expr.toJuliaString()).to.be.equal('^(x, y) + x ^ y');
  });
  it('toJuliaString() for "max(1, 2, 3) + min(1, 2, 3)"', () => {
    let expr = Expression.fromString('max(1, 2, 3) + min(1, 2, 3)');
    expect(expr.toJuliaString()).to.be.equal('max(1.0, 2.0, 3.0) + min(1.0, 2.0, 3.0)');
  });
  it('toJuliaString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromString('exp(-kel*t)');
    expect(expr.toJuliaString()).to.be.equal('exp(-kel * t)');
  });
  it('toJuliaString() for "ln(x*y)"', () => {
    let expr = Expression.fromString('ln(x*y)');
    expect(expr.toJuliaString()).to.be.equal('log(x * y)');
  });
  it('toJuliaString() for "log(exp(1))"', () => {
    let expr = Expression.fromString('log(exp(1))');
    expect(expr.toJuliaString()).to.be.equal('log(exp(1.0))');
  });
  it('toJuliaString() for "log(8, 2)"', () => {
    let expr = Expression.fromString('log(8, 2)');
    expect(expr.toJuliaString()).to.be.equal('log(2.0, 8.0)');
  });
  it('toJuliaString() for "log10(100)"', () => {
    let expr = Expression.fromString('log10(100)');
    expect(expr.toJuliaString()).to.be.equal('log10(100.0)');
  });
  it('toJuliaString() for "ifg0(x-y, 1,2)"', () => {
    let expr = Expression.fromString('ifg0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y > 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "ife0(x-y, 1,2)"', () => {
    let expr = Expression.fromString('ife0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y == 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "ifge0(x-y, 1,2)"', () => {
    let expr = Expression.fromString('ifge0(x-y, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y >= 0 ? 1.0 : 2.0');
  });
  it('toJuliaString() for "factorial(x*y)"', () => {
    let expr = Expression.fromString('factorial(x*y)');
    expect(expr.toJuliaString()).to.be.equal('factorial(ceil(Int, x * y))');
  });
  it('toJuliaString() for "ceil(x*y)"', () => {
    let expr = Expression.fromString('ceil(x*y)');
    expect(expr.toJuliaString()).to.be.equal('ceil(x * y)');
  });
  it('toJuliaString() for "x and y or a and b"', () => {
    let expr = Expression.fromString('x and y or a and b');
    expect(expr.toJuliaString()).to.be.equal('x && y || a && b');
  });
  it('toJuliaString() for "true and (y > 0) or false and (1+2<0)"', () => {
    let expr = Expression.fromString('true and (y > 0) or false and (1+2<0)');
    expect(expr.toJuliaString()).to.be.equal('true && (y > 0.0) || false && (1.0 + 2.0 < 0.0)');
  });
  it('toJuliaString() for "x xor y xor (a<=b)"', () => {
    let expr = Expression.fromString('x xor y xor (a<=b)');
    expect(expr.toJuliaString()).to.be.equal('xor(xor(x, y), (a <= b))');
  });
  it('toJuliaString() for "not (x+y)"', () => {
    let expr = Expression.fromString('not (x+y)');
    expect(expr.toJuliaString()).to.be.equal('!(x + y)');
  });
});
