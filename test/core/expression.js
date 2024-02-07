/* global describe, it */
const { Expression } = require('../../src/core/expression');
require('../../src/sbml-export/expression');
require('../../src/matlab-export/expression');
const { expect } = require('chai');

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    let expression = Expression.fromString('x*y');
    expect(expression.toString()).be.equal('x * y');
  });
  
  it('Check to String for expression "x/(2*3)".', () => {
    let expression = Expression.fromString('x/(2*3)');
    expect(expression.toString()).be.equal('x / (2 * 3)');
  });

  it('Conversion to CMathML.', () => {
    let expr = Expression.fromString('x*y');
    expect(expr.toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion of t (time) to CMathML.', () => {
    expect(Expression.fromString('1 * x * t').toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><apply><times/><cn>1</cn><ci>x</ci></apply><csymbol definitionURL="http://www.sbml.org/sbml/symbols/time">t</csymbol></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = Expression.fromString('x*y');
    expect(expression.toString()).to.be.deep.equal('x * y');
  });

  it('Empty input.', () => {
    expect(() => {
      Expression.fromString();
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromString({});
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromString({xxx: 'yyy'});
    }).to.throw(TypeError);
  });

  it('Wrong expr syntax', () => {
    expect(() => {
      Expression.fromString('a/*');
    }).to.throw(TypeError);
    expect(() => {
      Expression.fromString('(a*b');
    }).to.throw(TypeError);
  });
});

describe('Unit test for Expression with number.', () => {
  it('Create expr from 3.14', () => {
    let expression = Expression.fromString(3.14);
    expect(expression.toString()).to.be.equal('3.14');
  });

  it('Create expression from 1e-15', () => {
    let expression = Expression.fromString(1e-15);
    expect(expression.toString()).to.be.equal('1e-15');
  });

  it('Conversion to Q.', () => {
    let expression = Expression.fromString(3.14);
    expect(expression.toString()).to.be.deep.equal('3.14');
  });

  it('Conversion to CMathML.', () => {
    expect(Expression.fromString(1.1).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    expect(Expression.fromString(1e-15).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn type="e-notation">1<sep/>-15</cn></math>');
  });
});

describe('Linearization for Expression', () => {
  it('Linearization of y = a*y + b', () => {
    let expr = Expression.fromString('a*y + b');
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', 'b']);
  });
  it('Linearization of y = a*y', () => {
    let expr = Expression.fromString('a*y');
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', '0']);
  });
  it('Linearization of y = b', () => {
    let expr = Expression.fromString('b');
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['0', 'b']);
  });
  it('Linearization of y = a*y^2 + b', () => {
    let expr = Expression.fromString('a*y^2 + b');
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['y * a', 'b']);
  });
});

describe('num method for Expression', () => {
  it('Check num for 1.1', () => {
    let expr = Expression.fromString(1.1);
    expect(expr).to.have.property('num', 1.1);
  });
  it('Check num for 0', () => {
    let expr = Expression.fromString(0);
    expect(expr).to.have.property('num', 0);
  });
  it('Check num for -1.1', () => {
    let expr = Expression.fromString(-1.1);
    expect(expr).to.have.property('num', -1.1);
  });
  it('Check num for "x-y"', () => {
    let expr = Expression.fromString('x-y');
    expect(expr).to.have.property('num', undefined);
  });
});

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
});
