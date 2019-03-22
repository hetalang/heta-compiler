/* global describe, it */
const { Numeric } = require('../../src/core/numeric');
const { ValidationError, SchemaValidationError } = require('../../src/exceptions');
const should = require('chai').should();

describe('Unit test for Numeric.', () => {
  it('Create numeric from 3.14', () => {
    should.Throw(() => {
      let numeric = new Numeric(3.14);
      numeric.should.has.property('num', 3.14);
      numeric.should.not.has.property('free');
    });
  });

  it('Create numeric from {num: 3.14}', () => {
    let numeric = new Numeric({num: 3.14});
    numeric.should.have.property('num', 3.14);
    numeric.should.not.have.property('free', true);
  });

  it('Create numeric from {num: 3.14, free: true}', () => {
    let numeric = new Numeric({num: 3.14, free: true});
    numeric.should.has.property('num', 3.14);
    numeric.should.has.property('free', true);
  });

  it('Create numeric from {num: 1e-15}', () => {
    let numeric = new Numeric({num: 1e-15});
    numeric.should.has.property('num', 1e-15);
  });

  it('Wrong input', () => {
    should.Throw(() => {
      new Numeric();
    });
    should.Throw(() => {
      new Numeric('a');
    });
    should.Throw(() => {
      new Numeric('1');
    });
    should.Throw(() => {
      new Numeric({xxx: 12});
    });
    should.Throw(() => {
      new Numeric({num: 12, free: 1});
    });
  });

  it('Conversion to Q.', () => {
    let numeric = new Numeric({num: 3.14, free: true});
    numeric.toQ().should.be.deep.equal({
      num: 3.14,
      free: true
    });
  });

  it('Conversion to CMathML.', () => {
    new Numeric({num: 1.1})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    new Numeric({num: 1e-15})
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1e-15</cn></math>');
  });
});
