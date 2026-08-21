/* global describe, it */
const { Expression } = require('../../src/core/expression');
const { Container } = require('../../src');
require('../../src/sbml-export/expression');
require('../../src/dynms/expression');
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

  it('Conversion of variadic "add" to CMathML.', () => {
    let expected = {
      'add()': '<apply><plus/></apply>',
      'add(x)': '<apply><plus/><ci>x</ci></apply>',
      'add(x, y)': '<apply><plus/><ci>x</ci><ci>y</ci></apply>',
      'add(x, y, z)': '<apply><plus/><ci>x</ci><ci>y</ci><ci>z</ci></apply>'
    };
    Object.entries(expected).forEach(([input, output]) => {
      expect(Expression.fromString(input).toCMathML(true)).to.equal(output);
    });
  });

  it('Conversion of variadic "multiply" to CMathML.', () => {
    let expected = {
      'multiply()': '<apply><times/></apply>',
      'multiply(x)': '<apply><times/><ci>x</ci></apply>',
      'multiply(x, y)': '<apply><times/><ci>x</ci><ci>y</ci></apply>',
      'multiply(x, y, z)': '<apply><times/><ci>x</ci><ci>y</ci><ci>z</ci></apply>'
    };
    Object.entries(expected).forEach(([input, output]) => {
      expect(Expression.fromString(input).toCMathML(true)).to.equal(output);
    });
  });

  it('Conversion of variadic "max" and "min" to SBML L3V2 CMathML.', () => {
    const expected = {
      'max(x)': '<apply><max/><ci>x</ci></apply>',
      'max(x, y)': '<apply><max/><ci>x</ci><ci>y</ci></apply>',
      'max(x, y, z)': '<apply><max/><ci>x</ci><ci>y</ci><ci>z</ci></apply>',
      'min(x)': '<apply><min/><ci>x</ci></apply>',
      'min(x, y)': '<apply><min/><ci>x</ci><ci>y</ci></apply>',
      'min(x, y, z)': '<apply><min/><ci>x</ci><ci>y</ci><ci>z</ci></apply>'
    };
    Object.entries(expected).forEach(([input, output]) => {
      expect(Expression.fromString(input).toCMathML(true)).to.equal(output);
    });
  });

  it('Conversion of core "sign" to SBML-compatible CMathML.', () => {
    let expr = Expression.fromString('sign(x)');
    expr.exprParsed.fnObj = { isCore: true };
    expect(expr.toCMathML(true)).to.equal(
      '<piecewise><piece><cn>-1</cn><apply><lt/><ci>x</ci><cn>0</cn></apply></piece><piece><cn>1</cn><apply><gt/><ci>x</ci><cn>0</cn></apply></piece><otherwise><cn>0</cn></otherwise></piecewise>'
    );
  });

  it('Conversion of canonical "piecewise" to CMathML.', () => {
    const expected = '<piecewise><piece><cn>1</cn><apply><gt/><csymbol definitionURL="http://www.sbml.org/sbml/symbols/time">t</csymbol><cn>1</cn></apply></piece><piece><cn>2</cn><apply><gt/><csymbol definitionURL="http://www.sbml.org/sbml/symbols/time">t</csymbol><cn>2</cn></apply></piece><otherwise><cn>0</cn></otherwise></piecewise>';
    expect(Expression.fromString('piecewise(1, t > 1, 2, t > 2, 0)').toCMathML(true)).to.equal(expected);
  });

  it('Rejects legacy and malformed "piecewise" argument order.', () => {
    expect(() => Expression.fromString('piecewise(t > 1, 1, t > 2, 2, 0)')).to.throw(TypeError);
    expect(() => Expression.fromString('piecewise(1, 2, 0)')).to.throw(TypeError);
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

describe('Boolean literal normalization', () => {
  it('normalizes 0 and 1 in boolean subexpressions only', () => {
    let expected = {
      '1 and 0': 'true and false',
      'not (1)': 'not (true)',
      '0 ? 2 : 3': 'false ? 2 : 3',
      'piecewise(2, 1, 3)': 'piecewise(2, true, 3)',
      'piecewise(1, x > 1, 2, x > 2, 0)': 'piecewise(1, x > 1, 2, x > 2, 0)'
    };

    Object.entries(expected).forEach(([input, output]) => {
      expect(Expression.fromString(input).toString()).to.equal(output);
    });
    expect(Expression.fromString('1').toString()).to.equal('1');
  });

  it('normalizes root literals in an explicit boolean context', () => {
    expect(Expression.fromString(1, { booleanContext: true }).toString()).to.equal('true');
    expect(Expression.fromString(0, { booleanContext: true }).toString()).to.equal('false');
  });

  it('rejects numeric literals other than 0 and 1 in boolean positions', () => {
    expect(() => Expression.fromString('2 and true')).to.throw(TypeError);
    expect(() => Expression.fromString('2 ? x : y')).to.throw(TypeError);
    expect(() => Expression.fromString(2, { booleanContext: true })).to.throw(TypeError);
  });

  it('normalizes DSwitcher and StopSwitcher numeric triggers', () => {
    let container = new Container();
    container.loadMany([
      { id: 'ds0', class: 'DSwitcher', trigger: 0 },
      { id: 'ds1', class: 'DSwitcher', trigger: 1 },
      { id: 'ss0', class: 'StopSwitcher', trigger: 0 },
      { id: 'ss1', class: 'StopSwitcher', trigger: 1 },
      { id: 'record', class: 'Record', assignments: { start_: 1 } }
    ]);
    container.knitMany();

    let namespace = container.namespaceStorage.get('nameless');
    expect(namespace.get('ds0').trigger.toString()).to.equal('false');
    expect(namespace.get('ds1').trigger.toString()).to.equal('true');
    expect(namespace.get('ss0').trigger.toString()).to.equal('false');
    expect(namespace.get('ss1').trigger.toString()).to.equal('true');
    expect(namespace.get('record').assignments.start_.toString()).to.equal('1');
    expect(container.hetaErrors()).to.have.lengthOf(0);
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

  it('Recursively expands function calls introduced by substitution.', () => {
    const container = new Container();
    container.loadMany([
      { id: 'my_plus0', action: 'defineFunction', arguments: [], math: 'add()' },
      { id: 'my_plus', action: 'defineFunction', arguments: ['x', 'y'], math: 'x + y' }
    ]);
    container.knitMany();

    const expression = Expression.fromString('my_plus(1, my_plus(1, my_plus0()))');
    expression.functionList().forEach((functionNode) => {
      functionNode.fnObj = container.functionDefStorage.get(functionNode.fn.name);
    });

    const expanded = expression.substituteByDefinitions();
    expect(expanded.toMathJSON()).to.deep.equal(['Add', 1, 1]);
  });

});
