/* global describe, it */
const { Expression } = require('../../src/core/expression');
const HetaLevelError = require('../../src/heta-level-error');
const { Container } = require('../../src');
require('../../src/sbml-export/expression');
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
    }).to.throw(TypeError).and.not.have.property('diagnosticCode');
    expect(() => {
      Expression.fromString({xxx: 'yyy'});
    }).to.throw(TypeError);
  });

  it('Wrong expr syntax', () => {
    expect(() => {
      Expression.fromString('a/*');
    }).to.throw(HetaLevelError);
    expect(() => {
      Expression.fromString('(a*b');
    }).to.throw(HetaLevelError);
    expect(() => Expression.fromString('[1, 2]')).to.throw(HetaLevelError)
      .with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_EXPRESSION', expression: '[1, 2]', nodeTypes: ['ArrayNode']});
    for (const expression of ['x ? 1 : 2', '1 ? 1 : 2', 'true ? (x ? 1 : 2) : 3']) {
      expect(() => Expression.fromString(expression)).to.throw(HetaLevelError)
        .with.property('opt').that.includes({diagnosticCode: 'INVALID_EXPRESSION', expression});
    }
    expect(() => Expression.fromString('y ? x : z'))
      .to.throw(HetaLevelError, 'Condition "y" must be a boolean expression.')
      .with.property('opt').that.includes({diagnosticCode: 'INVALID_EXPRESSION', expression: 'y ? x : z', condition: 'y'});
    expect(() => Expression.fromString('(y) ? x : z', {functionArguments: ['y']})).not.to.throw();
    expect(() => Expression.fromString('unknown ? x : z', {functionArguments: ['y']})).to.throw(HetaLevelError);
    expect(() => Expression.fromString('1 ? x : z', {functionArguments: ['y']})).to.throw(HetaLevelError);
    for (const expression of ['(x > 0 ? true : false) ? 1 : 0', '((x >= 0.49) ? true : false) ? 1 : 0', '((x > 0 ? true : false) ? false : true) ? 1 : 0']) {
      expect(() => Expression.fromString(expression), expression).not.to.throw();
    }
    for (const expression of ['(x > 0 ? true : 1) ? 1 : 0', '(x > 0 ? 1 : false) ? 1 : 0']) {
      expect(() => Expression.fromString(expression), expression).to.throw(HetaLevelError)
        .with.property('opt').that.includes({diagnosticCode: 'INVALID_EXPRESSION', expression});
    }
    for (const expression of ['x % 2', 'x!', 'x & 2', 'x << 2', '1 + (x mod 2)']) {
      expect(() => Expression.fromString(expression)).to.throw(HetaLevelError)
        .with.property('opt').that.includes({diagnosticCode: 'INVALID_EXPRESSION', expression});
    }
    for (const expression of ['+x', '-x', 'x + y', 'x - y', 'x * y', 'x / y', 'x ^ y',
      'x > y', 'x >= y', 'x < y', 'x <= y', 'x == y', 'x != y',
      'x and y', 'x or y', 'x xor y', 'not x', 'x > y ? x : y', 'true ? x : y', '(x > y) ? x : y', 'factorial(x)']) {
      expect(() => Expression.fromString(expression), expression).not.to.throw();
    }
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

describe('Function definition substitution', () => {
  it('Binds outer arguments before expanding nested function calls.', () => {
    const container = new Container();
    container.loadMany([
      { id: 'sumOf', action: 'defineFunction', arguments: ['a', 'b'], math: 'a + b' },
      { id: 'powersOf', action: 'defineFunction', arguments: ['x'], math: 'sumOf(x^2, x^3)' }
    ]);
    container.knitMany();

    const expression = Expression.fromString('powersOf(y + 1)');
    expression.functionList()[0].fnObj = container.functionDefStorage.get('powersOf');

    expect(expression.substituteByDefinitions().toString())
      .to.equal('(y + 1) ^ 2 + (y + 1) ^ 3');
  });

  it('expands several levels of nested function calls', () => {
    const container = new Container();
    container.loadMany([
      { id: 'addone', action: 'defineFunction', arguments: ['x'], math: 'x + 1' },
      { id: 'twice', action: 'defineFunction', arguments: ['x'], math: 'addone(x) + addone(x)' },
      { id: 'deep', action: 'defineFunction', arguments: ['x'], math: 'twice(x) + twice(x)' }
    ]);
    container.knitMany();

    const expression = Expression.fromString('deep(3)');
    expression.functionList()[0].fnObj = container.functionDefStorage.get('deep');
    const expanded = expression.substituteByDefinitions();

    expect(expanded.toString()).not.to.match(/addone|twice|deep/);
    expect(expanded.exprParsed.evaluate()).to.equal(16);
  });
});
