/* global describe, it */
const { Expression } = require('../../src/core/expression');
const { expect } = require('chai');

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    let expression = Expression.fromQ('x*y');
    expect(expression.expr).be.equal('x * y');
  });

  it('Conversion to CMathML.', () => {
    expect(Expression.fromQ({expr: 'x*y'}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = Expression.fromQ({expr: 'x*y'});
    expect(expression.toQ()).to.be.deep.equal({
      expr: 'x * y'
    });
  });

  it('Empty input.', () => {
    expect(() => {
      Expression.fromQ();
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromQ({});
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromQ({xxx: 'yyy'});
    }).to.throw(TypeError);
  });

  it('Wrong expr syntax', () => {
    expect(() => {
      Expression.fromQ({expr: 'a/*'});
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromQ({expr: '(a*b'});
    }).to.throw(TypeError);
  });
});

describe('Unit test for Expression with number.', () => {
  it('Create expr from 3.14', () => {
    let expression = Expression.fromQ(3.14);
    expect(expression).to.have.property('expr', '3.14');
  });

  it('Create expression from {expr: 1e-15}', () => {
    let expression = Expression.fromQ({expr: 1e-15});
    expect(expression).to.have.property('expr', '1e-15');
  });

  it('Conversion to Q.', () => {
    let expression = Expression.fromQ({expr: 3.14});
    expect(expression.toQ()).to.be.deep.equal({
      expr: '3.14'
    });
  });

  it('Conversion to CMathML.', () => {
    expect(Expression.fromQ({expr: 1.1}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    expect(Expression.fromQ({expr: 1e-15}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn type="e-notation">1<sep/>-15</cn></math>');
  });
});

describe('Linearization for Expression', () => {
  it('Linearization of y = a*y + b', () => {
    let expr = Expression.fromQ({expr: 'a*y + b', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', 'b']);
  });
  it('Linearization of y = a*y', () => {
    let expr = Expression.fromQ({expr: 'a*y', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', '0']);
  });
  it('Linearization of y = b', () => {
    let expr = Expression.fromQ({expr: 'b', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['0', 'b']);
  });
  it('Linearization of y = a*y^2 + b', () => {
    let expr = Expression.fromQ({expr: 'a*y^2 + b'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['y * a', 'b']);
  });
});

describe('num method for Expression', () => {
  it('Check num for 1.1', () => {
    let expr = Expression.fromQ(1.1);
    expect(expr).to.have.property('num', 1.1);
  });
  it('Check num for 0', () => {
    let expr = Expression.fromQ(0);
    expect(expr).to.have.property('num', 0);
  });
  it('Check num for -1.1', () => {
    let expr = Expression.fromQ(-1.1);
    expect(expr).to.have.property('num', -1.1);
  });
  it('Check num for "x-y"', () => {
    let expr = Expression.fromQ('x-y');
    expect(expr).to.have.property('num', undefined);
  });
});

describe('Expession exports', () => {
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

  it('toMatlabString() for "pow(x, y)"', () => {
    let expr = Expression.fromQ('pow(x, y)');
    expect(expr.toMatlabString()).to.be.equal('power(x, y)');
  });
  it('toMatlabString() for "max(1, 2, 3)"', () => {
    let expr = Expression.fromQ('max(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('max([1, 2, 3])');
  });
  it('toMatlabString() for "min(1, 2, 3)"', () => {
    let expr = Expression.fromQ('min(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('min([1, 2, 3])');
  });
  it('toMatlabString() for "log(x)"', () => {
    let expr = Expression.fromQ('log(x)');
    expect(expr.toMatlabString()).to.be.equal('log(x)');
  });
  it('toMatlabString() for "log(x, y)"', () => {
    let expr = Expression.fromQ('log(x, y)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(y))');
  });
  it('toMatlabString() for "log10(x)"', () => {
    let expr = Expression.fromQ('log10(x)');
    expect(expr.toMatlabString()).to.be.equal('log10(x)');
  });
  it('toMatlabString() for "log2(x)"', () => {
    let expr = Expression.fromQ('log2(x)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(2))');
  });
  it('toMatlabString() for "exp(-kel*t)"', () => {
    let expr = Expression.fromQ('exp(-kel*t)');
    expect(expr.toMatlabString()).to.be.equal('exp(-kel * time)');
  });
});
