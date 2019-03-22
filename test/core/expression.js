/* global describe, it */
const { Expression } = require('../../src/core/expression');
const { ValidationError, SchemaValidationError } = require('../../src/exceptions');
const should = require('chai').should();

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    should.Throw(() => {
      let expression = new Expression('x*y');
      should(expression.expr).be.equal('x * y');
    });
  });

  it('Create Expression from {expr: "x*y"}.', () => {
    let expression = new Expression({expr: 'x*y'});
    expression.expr.should.be.equal('x * y');
  });

  it('Conversion to CMathML.', () => {
    new Expression({expr: 'x*y'})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 'x*y'});
    expression.toQ().should.be.deep.equal({
      expr: 'x * y'
    });
  });

  it('Empty input.', () => {
    should.Throw(() => {
      new Expression();
    }, SchemaValidationError);
    should.Throw(() => {
      new Expression({});
    }, SchemaValidationError);
    should.Throw(() => {
      new Expression({xxx: 'yyy'});
    }, SchemaValidationError);
    should.Throw(() => {
      new Expression('');
    }, SchemaValidationError);
  });

  it('Wrong input', () => {
    should.Throw(() => {
      new Expression({expr: 'a/*'});
    });
    should.Throw(() => {
      new Expression({expr: '(a*b'});
    });
  });
});
