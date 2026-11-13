/* global describe, it */
const { Expression } = require('../../src/core/expression');
const { Builder } = require('../../src');
require('../../src/matlab-export/expression');
const { expect } = require('chai');

describe('Expession exports', () => {

  it('preserves grouping for nested Heta arithmetic functions', () => {
    expect(Expression.fromString('divide(add(a, b), c)').toMatlabString()).to.equal('rdivide((a + b), c)');
    expect(Expression.fromString('multiply(subtract(a, b), c)').toMatlabString()).to.equal('(minus(a, b) * c)');
  });

  it('exports add with any number of arguments', () => {
    expect(Expression.fromString('add()').toMatlabString()).to.equal('0');
    expect(Expression.fromString('add(a)').toMatlabString()).to.equal('(a)');
    expect(Expression.fromString('add(a, b)').toMatlabString()).to.equal('(a + b)');
    expect(Expression.fromString('add(a, b, c, d)').toMatlabString()).to.equal('(a + b + c + d)');
  });

  it('preserves add argument grouping and nested expressions', () => {
    expect(Expression.fromString('add(a, b - c, d * e)').toMatlabString()).to.equal('(a + (b - c) + (d * e))');
    expect(Expression.fromString('add(a, add(b, c), divide(d, e))').toMatlabString()).to.equal('(a + (b + c) + rdivide(d, e))');
    expect(Expression.fromString('2 * add(a, b, c)').toMatlabString()).to.equal('2 * (a + b + c)');
    expect(Expression.fromString('add(t, pow(a, b), c)').toMatlabString()).to.equal('(time + power(a, b) + c)');
    expect(Expression.fromString('add(a, b + c)').toMatlabString()).to.equal('(a + (b + c))');
    expect(Expression.fromString('add(a, b / c)').toMatlabString()).to.equal('(a + (b / c))');
    expect(Expression.fromString('add(a, -b)').toMatlabString()).to.equal('(a + (-b))');
    expect(Expression.fromString('a - add(b, c, d)').toMatlabString()).to.equal('a - (b + c + d)');
    expect(Expression.fromString('add(a, b) ^ c').toMatlabString()).to.equal('((a + b) ^ c)');
    expect(Expression.fromString('add(a, b) / c').toMatlabString()).to.equal('(a + b) / c');
    expect(Expression.fromString('add(a, b > c ? d : e)').toMatlabString()).to.equal('(a + tern__(b > c, d, e))');
  });

  it('exports multiply with any number of arguments', () => {
    expect(Expression.fromString('multiply()').toMatlabString()).to.equal('1');
    expect(Expression.fromString('multiply(a)').toMatlabString()).to.equal('(a)');
    expect(Expression.fromString('multiply(a, b)').toMatlabString()).to.equal('(a * b)');
    expect(Expression.fromString('multiply(a, b, c, d)').toMatlabString()).to.equal('(a * b * c * d)');
  });

  it('preserves multiply argument grouping and nested expressions', () => {
    expect(Expression.fromString('multiply(a, b + c, d / e)').toMatlabString()).to.equal('(a * (b + c) * (d / e))');
    expect(Expression.fromString('multiply(a, b * c)').toMatlabString()).to.equal('(a * (b * c))');
    expect(Expression.fromString('multiply(a, add(b, c), multiply(d, e))').toMatlabString()).to.equal('(a * (b + c) * (d * e))');
    expect(Expression.fromString('divide(a, multiply(b, c, d))').toMatlabString()).to.equal('rdivide(a, (b * c * d))');
    expect(Expression.fromString('multiply(a, b) ^ c').toMatlabString()).to.equal('((a * b) ^ c)');
    expect(Expression.fromString('multiply(a, -b)').toMatlabString()).to.equal('(a * (-b))');
    expect(Expression.fromString('multiply(t, pow(a, b), c)').toMatlabString()).to.equal('(time * power(a, b) * c)');
  });

  it('preserves parentheses in generated Simbio rules', () => {
    const source = `
a @Const { num: 1 };
b @Const { num: 2 };
c @Const { num: 3 };
x @Record := 2 * add(a, b - c, c);
y @Record := multiply(a, b + c, c);
`;
    const builder = new Builder({
      options: {},
      importModule: { source: 'index.heta', type: 'heta' },
      export: [{ format: 'Simbio' }]
    }, () => source, () => {});
    const errors = [];
    builder.logger.addTransport((level, message) => {
      if (level === 'error') errors.push(message);
    });
    builder.run();
    expect(errors, errors.join('\n')).to.be.empty;
    const model = builder.exportArray[0].makeText()[0].content;
    expect(model).to.include('x = 2 * (a + (b - c) + c)');
    expect(model).to.include('y = (a * (b + c) * c)');
  });

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
  it('toMatlabString() for "x++y"', () => {
    let expr = Expression.fromString('x++y');
    expect(expr.toMatlabString()).to.be.equal('x + y');
  });
});
