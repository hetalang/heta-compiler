/* global describe, it */
const { Expression } = require('../../src/core/expression');
const should = require('chai').should();
const { expect } = require('chai');

describe('Unit test for Expression.', () => {
  it('Create expession from "x*y".', () => {
    should.Throw(() => {
      let expression = new Expression('x*y');
      should(expression.expr).be.equal('x * y');
    });
  });

  it('Create Expression from {expr: "x*y", units: "L"}.', () => {
    let expression = new Expression({expr: 'x*y', units: 'L'});
    expression.should.have.property('expr', 'x * y');
    expression.should.have.property('units', 'L');
  });

  it('Conversion to CMathML.', () => {
    new Expression({expr: 'x*y'})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><apply><times/><ci>x</ci><ci>y</ci></apply></math>');
  });

  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 'x*y', units: 'L'});
    expression.toQ().should.be.deep.equal({
      expr: 'x * y',
      units: 'L'
    });
  });

  it('Empty input.', () => {
    should.Throw(() => {
      new Expression();
    }, Error);
    should.Throw(() => {
      new Expression({});
    }, Error);
    should.Throw(() => {
      new Expression({xxx: 'yyy'});
    }, Error);
  });

  it('Wrong input', () => {
    should.Throw(() => {
      new Expression({expr: 'a/*'});
    }, Error);
    should.Throw(() => {
      new Expression({expr: '(a*b'});
    }, Error);
  });
});

describe('Unit test for Expression with number.', () => {
  it('Create expr from 3.14', () => {
    let expression = new Expression(3.14);
    expression.should.has.property('expr', '3.14');
  });

  it('Create expr from {expr: 3.14, units: "L"}', () => {
    let expression = new Expression({expr: 3.14, units: 'L'});
    expression.should.have.property('expr', '3.14');
    expression.should.have.property('units', 'L');
  });


  it('Create expression from {expr: 1e-15}', () => {
    let expression = new Expression({expr: 1e-15});
    expression.should.has.property('expr', '1e-15');
  });


  it('Conversion to Q.', () => {
    let expression = new Expression({expr: 3.14, units: 'L'});
    expression.toQ().should.be.deep.equal({
      expr: '3.14',
      units: 'L'
    });
  });

  it('Conversion to CMathML.', () => {
    new Expression({expr: 1.1})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    new Expression({expr: 1e-15})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn type="e-notation">1<sep/>-15</cn></math>');

  });
});

describe('Methods for Expression', () => {
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
    let expr = new Expression({expr: 'a*y^2 + b', id: 'y'});
    let res = expr
      .linearizeFor('y')
      .map((expression) => expression.toString());
    expect(res).to.deep.equal(['y * a', 'b']);
  });
});
