/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/mrgsolve-export/expression');
const { expect } = require('chai');

describe('Expession exports to mrgsolve', () => {
  it('toCString() for "x*y"', () => {
    let expr = Expression.fromQ('x*y');
    expect(expr.toCString()).to.be.equal('x * y');
  });
  it('toCString() for 1.1', () => {
    let expr = Expression.fromQ(1.1);
    expect(expr.toCString()).to.be.equal('1.1');
  });
  it('toCString() for 0', () => {
    let expr = Expression.fromQ(0);
    expect(expr.toCString()).to.be.equal('0.0');
  });
  it('toCString() for -1', () => {
    let expr = Expression.fromQ(-1);
    expect(expr.toCString()).to.be.equal('-1.0');
  });
  it('toCString() for "x*(1+2.2)/3"', () => {
    let expr = Expression.fromQ('x*(1+2.2)/3');
    expect(expr.toCString()).to.be.equal('x * (1.0 + 2.2) / 3.0');
  });
  it('toCString() for "pow(x, y) + x^y"', () => {
    let expr = Expression.fromQ('pow(x, y) + x^y');
    expect(expr.toCString()).to.be.equal('pow(x, y) + pow(x, y)');
  });
  it('toCString() for "abs(-1/2)"', () => {
    let expr = Expression.fromQ('abs(-1/2)');
    expect(expr.toCString()).to.be.equal('fabs(-1.0 / 2.0)');
  });
  it('toCString() for "max(1, 2, 3) + min(1, 2, 3)"', () => {
    let expr = Expression.fromQ('max(1, 2, 3) + min(1, 2, 3)');
    expect(expr.toCString()).to.be.equal('std::max(1.0, 2.0, 3.0) + std::min(1.0, 2.0, 3.0)');
  });
  it('toCString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromQ('exp(-kel*t)');
    expect(expr.toCString()).to.be.equal('exp(-kel * SOLVERTIME)');
  });
});