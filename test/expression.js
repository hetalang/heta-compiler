/* global describe, it */
const { Expression } = require('../src/core/expression');
const { ValidationError, SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    let expression = new Expression('x*y');
    should(expression.expr).be.equal('x * y');
  });

  it('Create Expression from {expr: "x*y"}.', () => {
    let expression = new Expression({expr: 'x*y'});
    should(expression.expr).be.equal('x * y');
  });

  it('Conversion to CMathML.', () => {
    let cmathml1 = new Expression('x*y')
      .exprCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 'x*y'});
    expression.toQ().should.be.deepEqual({
      expr: 'x * y'
    });
  });

  it('Empty input.', () => {
    should.throws(() => {
      new Expression();
    }, SchemaValidationError);
    should.throws(() => {
      new Expression({});
    }, SchemaValidationError);
    should.throws(() => {
      new Expression({xxx: 'yyy'});
    }, SchemaValidationError);
    should.throws(() => {
      new Expression('');
    }, SchemaValidationError);
  });

  it('Wrong input', () => {
    should.throws(() => {
      new Expression('a/*');
    });
    should.throws(() => {
      new Expression('(a*b');
    });
  });
});
