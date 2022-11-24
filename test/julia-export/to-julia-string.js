/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/julia-export/expression');
const { expect } = require('chai');

describe('Expression exports to Julia', () => {
  it('toJuliaString() for "abs(-1/2)"', () => {
    let expr = Expression.fromString('abs(-1/2)');
    expect(expr.toJuliaString()).to.be.equal('abs(-1e+0 / 2e+0)');
  });
  it('toJuliaString() for "x*y"', () => {
    let expr = Expression.fromString('x*y');
    expect(expr.toJuliaString()).to.be.equal('x * y');
  });
  it('toJuliaString() for "multiply(x,y)"', () => {
    let expr = Expression.fromString('multiply(x,y)');
    expect(expr.toJuliaString()).to.be.equal('*(x, y)');
  });
  it('toJuliaString() for "subtract(x,y)"', () => {
    let expr = Expression.fromString('subtract(x,y)');
    expect(expr.toJuliaString()).to.be.equal('-(x, y)');
  });
  it('toJuliaString() for "divide(x,y)"', () => {
    let expr = Expression.fromString('divide(x,y)');
    expect(expr.toJuliaString()).to.be.equal('/(x, y)');
  });
  it('toJuliaString() for "plus(x,y)"', () => {
    let expr = Expression.fromString('plus(x,y)');
    expect(expr.toJuliaString()).to.be.equal('+(x, y)');
  });
  it('toJuliaString() for "square(x)"', () => {
    let expr = Expression.fromString('square(x)');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.pow(x, 2)');
  });
  it('toJuliaString() for "cube(x)"', () => {
    let expr = Expression.fromString('cube(x)');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.pow(x, 3)');
  });
  it('toJuliaString() for 1.1', () => {
    let expr = Expression.fromString(1.1);
    expect(expr.toJuliaString()).to.be.equal('1.1');
  });
  it('toJuliaString() for 0', () => {
    let expr = Expression.fromString(0);
    expect(expr.toJuliaString()).to.be.equal('0e+0');
  });
  it('toJuliaString() for -1', () => {
    let expr = Expression.fromString(-1);
    expect(expr.toJuliaString()).to.be.equal('-1e+0');
  });
  it('toJuliaString() for "x*(1+2.2)/3"', () => {
    let expr = Expression.fromString('x*(1+2.2)/3');
    expect(expr.toJuliaString()).to.be.equal('x * (1e+0 + 2.2) / 3e+0');
  });
  it('toJuliaString() for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromString('pow(x, y) + x^y');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.pow(x, y) + NaNMath.pow(x, y)');
  });
  it('toJuliaString() for "max(1, 2, 3) + min(1, 2, 3)"', () => {
    let expr = Expression.fromString('max(1, 2, 3) + min(1, 2, 3)');
    expect(expr.toJuliaString()).to.be.equal('max(1e+0, 2e+0, 3e+0) + min(1e+0, 2e+0, 3e+0)');
  });
  it('toJuliaString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromString('exp(-kel*t)');
    expect(expr.toJuliaString()).to.be.equal('exp(-kel * t)');
  });
  it('toJuliaString() for "ln(x*y)"', () => {
    let expr = Expression.fromString('ln(x*y)');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.log(x * y)');
  });
  it('toJuliaString() for "log(exp(1))"', () => {
    let expr = Expression.fromString('log(exp(1))');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.log(exp(1e+0))');
  });
  it('toJuliaString() for "log(8, 2)"', () => {
    let expr = Expression.fromString('log(8, 2)');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.log(2e+0, 8e+0)');
  });
  it('toJuliaString() for "log10(100)"', () => {
    let expr = Expression.fromString('log10(100)');
    expect(expr.toJuliaString()).to.be.equal('NaNMath.log10(1e+2)');
  });
  it('toJuliaString() for "ifgt(x-y, 0, 1,2)"', () => {
    let expr = Expression.fromString('ifgt(x-y, 0, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y > 0e+0 ? 1e+0 : 2e+0');
  });
  it('toJuliaString() for "ifeq(x-y, 0, 1,2)"', () => {
    let expr = Expression.fromString('ifeq(x-y, 0, 1,2)');
    expect(expr.toJuliaString()).to.be.equal('x - y == 0e+0 ? 1e+0 : 2e+0');
  });
  it('toJuliaString() for "ifge(x-y, 0, 1, 2)"', () => {
    let expr = Expression.fromString('ifge(x-y, 0, 1, 2)');
    expect(expr.toJuliaString()).to.be.equal('x - y >= 0e+0 ? 1e+0 : 2e+0');
  });
  it('toJuliaString() for "factorial(x*y)"', () => {
    let expr = Expression.fromString('factorial(x*y)');
    expect(expr.toJuliaString()).to.be.equal('fact(x * y)');
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
    expect(expr.toJuliaString()).to.be.equal('true && (y > 0e+0) || false && (1e+0 + 2e+0 < 0e+0)');
  });
  it('toJuliaString() for "x xor y xor (a<=b)"', () => {
    let expr = Expression.fromString('x xor y xor (a<=b)');
    expect(expr.toJuliaString()).to.be.equal('xor(xor(x, y), (a <= b))');
  });
  it('toJuliaString() for "not (x+y)"', () => {
    let expr = Expression.fromString('not (x+y)');
    expect(expr.toJuliaString()).to.be.equal('!(x + y)');
  });
  it('toJuliaString() for "ifgt(1, 2, 3, 4)"', () => {
    let expr = Expression.fromString('ifgt(1, 2, 3, 4)');
    expect(expr.toJuliaString()).to.be.equal('1e+0 > 2e+0 ? 3e+0 : 4e+0');
  });
  it('toJuliaString() for "ifge(1, 2, 3, 4)"', () => {
    let expr = Expression.fromString('ifge(1, 2, 3, 4)');
    expect(expr.toJuliaString()).to.be.equal('1e+0 >= 2e+0 ? 3e+0 : 4e+0');
  });
  it('toJuliaString() for "iflt(1, 2, 3, 4)"', () => {
    let expr = Expression.fromString('iflt(1, 2, 3, 4)');
    expect(expr.toJuliaString()).to.be.equal('1e+0 < 2e+0 ? 3e+0 : 4e+0');
  });
  it('toJuliaString() for "ifle(1, 2, 3, 4)"', () => {
    let expr = Expression.fromString('ifle(1, 2, 3, 4)');
    expect(expr.toJuliaString()).to.be.equal('1e+0 <= 2e+0 ? 3e+0 : 4e+0');
  });
  it('toJuliaString() for "Infinity/4"', () => {
    let expr = Expression.fromString('Infinity/4');
    expect(expr.toJuliaString()).to.be.equal('Inf / 4e+0');
  });
  it('toJuliaString() for "NaN*2"', () => {
    let expr = Expression.fromString('NaN*2');
    expect(expr.toJuliaString()).to.be.equal('NaN * 2e+0');
  });
  it('toJuliaString() for "1*e/4"', () => {
    let expr = Expression.fromString('1*e/4');
    expect(expr.toJuliaString()).to.be.equal('1e+0 * exp(1.0) / 4e+0');
  });
});
