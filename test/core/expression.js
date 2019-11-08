/* global describe, it */
const { Expression } = require('../../src/core/expression');
const { expect } = require('chai');

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    let expression = new Expression('x*y');
    expect(expression.expr).be.equal('x * y');
  });

  it('Create Expression from {expr: "x*y", units: "L"}.', () => {
    let expression = new Expression({expr: 'x*y', units: 'L'});
    expect(expression).to.have.property('expr', 'x * y');
    expect(expression).to.have.property('units', 'L');
  });

  it('Conversion to CMathML.', () => {
    expect(new Expression({expr: 'x*y'}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 'x*y', units: 'L'});
    expect(expression.toQ()).to.be.deep.equal({
      expr: 'x * y',
      units: 'L'
    });
  });

  it('Empty input.', () => {
    expect(() => {
      new Expression();
    }).to.throw(TypeError);
    expect(() => {
      new Expression({});
    }).to.throw(TypeError);
    expect(() => {
      new Expression({xxx: 'yyy'});
    }).to.throw(TypeError);
  });

  it('Wrong expr syntax', () => {
    expect(() => {
      new Expression({expr: 'a/*'});
    }).to.throw(TypeError);
    expect(() => {
      new Expression({expr: '(a*b'});
    }).to.throw(TypeError);
  });
});

describe('Unit test for Expression with number.', () => {
  it('Create expr from 3.14', () => {
    let expression = new Expression(3.14);
    expect(expression).to.have.property('expr', '3.14');
  });

  it('Create expr from {expr: 3.14, units: "L"}', () => {
    let expression = new Expression({expr: 3.14, units: 'L'});
    expect(expression).to.have.property('expr', '3.14');
    expect(expression).to.have.property('units', 'L');
  });


  it('Create expression from {expr: 1e-15}', () => {
    let expression = new Expression({expr: 1e-15});
    expect(expression).to.have.property('expr', '1e-15');
  });


  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 3.14, units: 'L'});
    expect(expression.toQ()).to.be.deep.equal({
      expr: '3.14',
      units: 'L'
    });
  });

  it('Conversion to CMathML.', () => {
    expect(new Expression({expr: 1.1}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    expect(new Expression({expr: 1e-15}).toCMathML()).to.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn type="e-notation">1<sep/>-15</cn></math>');

  });
});

describe('Linearization for Expression', () => {
  it('Linearization of y = a*y + b', () => {
    let expr = new Expression({expr: 'a*y + b', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', 'b']);
  });
  it('Linearization of y = a*y', () => {
    let expr = new Expression({expr: 'a*y', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['a', '0']);
  });
  it('Linearization of y = b', () => {
    let expr = new Expression({expr: 'b', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['0', 'b']);
  });
  it('Linearization of y = a*y^2 + b', () => {
    let expr = new Expression({expr: 'a*y^2 + b'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['y * a', 'b']);
  });
});

describe('num method for Expression', () => {
  it('Check num for 1.1', () => {
    let expr = new Expression(1.1);
    expect(expr).to.have.property('num', 1.1);
  });
  it('Check num for 0', () => {
    let expr = new Expression(0);
    expect(expr).to.have.property('num', 0);
  });
  it('Check num for -1.1', () => {
    let expr = new Expression(-1.1);
    expect(expr).to.have.property('num', -1.1);
  });
  it('Check num for "x-y"', () => {
    let expr = new Expression('x-y');
    expect(expr).to.have.property('num', undefined);
  });
});

describe('Expession exports', () => {
  it('toCString() for "x*y"', () => {
    let expr = new Expression('x*y');
    expect(expr.toCString()).to.be.equal('x * y');
  });
  it('toCString() for 1.1', () => {
    let expr = new Expression(1.1);
    expect(expr.toCString()).to.be.equal('1.1');
  });
  it('toCString() for 0', () => {
    let expr = new Expression(0);
    expect(expr.toCString()).to.be.equal('0.0');
  });
  it('toCString() for -1', () => {
    let expr = new Expression(-1);
    expect(expr.toCString()).to.be.equal('-1.0');
  });
  it('toCString() for "x*(1+2.2)/3"', () => {
    let expr = new Expression('x*(1+2.2)/3');
    expect(expr.toCString()).to.be.equal('x * (1.0 + 2.2) / 3.0');
  });
  it('toCString() for "pow(x, y) + x^y"', () => {
    let expr = new Expression('pow(x, y) + x^y');
    expect(expr.toCString()).to.be.equal('pow(x, y) + pow(x, y)');
  });
  it('toCString() for "abs(-1/2)"', () => {
    let expr = new Expression('abs(-1/2)');
    expect(expr.toCString()).to.be.equal('fabs(-1.0 / 2.0)');
  });
  it('toCString() for "max(1, 2, 3) + min(1, 2, 3)"', () => {
    let expr = new Expression('max(1, 2, 3) + min(1, 2, 3)');
    expect(expr.toCString()).to.be.equal('std::max(1.0, 2.0, 3.0) + std::min(1.0, 2.0, 3.0)');
  });
  it('toCString() for "exp(-kel*t)"', () => {
    let expr = new Expression('exp(-kel*t)');
    expect(expr.toCString()).to.be.equal('exp(-kel * SOLVERTIME)');
  });

  it('toSLVString("keep") for "pow(x, y) + x^y"', () => {
    let expr = new Expression('pow(x, y) + x^y');
    expect(expr.toSLVString('keep')).to.be.equal('pow(x, y) + x ^ y');
  });
  it('toSLVString("function") for "pow(x, y) + x^y"', () => {
    let expr = new Expression('pow(x, y) + x^y');
    expect(expr.toSLVString('function')).to.be.equal('pow(x, y) + pow(x, y)');
  });
  it('toSLVString("operator") for "pow(x, y) + x^y"', () => {
    let expr = new Expression('pow(x, y) + x^y');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ y + x ^ y');
  });
  it('toSLVString("operator") for "pow(x, y+z)"', () => {
    let expr = new Expression('pow(x, y+z)');
    expect(expr.toSLVString('operator')).to.be.equal('x ^ (y + z)');
  });
  it('toSLVString("operator") for "pow(-1, n)"', () => {
    let expr = new Expression('pow(-1, n)');
    expect(expr.toSLVString('operator')).to.be.equal('(-1) ^ n');
  });
  it('toSLVString("operator") for "pow(n, -1/2)"', () => {
    let expr = new Expression('pow(n, -1/2)');
    expect(expr.toSLVString('operator')).to.be.equal('n ^ (-1 / 2)');
  });
  it('Wrong powTransform', () => {
    let expr = new Expression('pow(a, b)');
    expect(() => expr.toSLVString('xxx')).Throw(TypeError);
  });

  it('toMatlabString() for "pow(x, y)"', () => {
    let expr = new Expression('pow(x, y)');
    expect(expr.toMatlabString()).to.be.equal('power(x, y)');
  });
  it('toMatlabString() for "max(1, 2, 3)"', () => {
    let expr = new Expression('max(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('max([1, 2, 3])');
  });
  it('toMatlabString() for "min(1, 2, 3)"', () => {
    let expr = new Expression('min(1, 2, 3)');
    expect(expr.toMatlabString()).to.be.equal('min([1, 2, 3])');
  });
  it('toMatlabString() for "log(x)"', () => {
    let expr = new Expression('log(x)');
    expect(expr.toMatlabString()).to.be.equal('log(x)');
  });
  it('toMatlabString() for "log(x, y)"', () => {
    let expr = new Expression('log(x, y)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(y))');
  });
  it('toMatlabString() for "log10(x)"', () => {
    let expr = new Expression('log10(x)');
    expect(expr.toMatlabString()).to.be.equal('log10(x)');
  });
  it('toMatlabString() for "log2(x)"', () => {
    let expr = new Expression('log2(x)');
    expect(expr.toMatlabString()).to.be.equal('(log(x)/log(2))');
  });
  it('toMatlabString() for "exp(-kel*t)"', () => {
    let expr = new Expression('exp(-kel*t)');
    expect(expr.toMatlabString()).to.be.equal('exp(-kel * time)');
  });
});
