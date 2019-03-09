/* global describe, it */
const { Numeric } = require('../src/core/numeric');
const { ValidationError, SchemaValidationError } = require('../src/exceptions');
const should = require('should');

describe('Unit test for Numeric.', () => {
  it('Create numeric from 3.14', () => {
    let numeric = new Numeric(3.14);
    numeric.should.has.property('num', 3.14);
    numeric.should.has.property('free').not.ok();
  });

  it('Create numeric from {num: 3.14}', () => {
    let numeric = new Numeric({num: 3.14});
    numeric.should.has.property('num', 3.14);
    numeric.should.has.property('free').not.ok();
  });

  it('Create numeric from {num: 3.14, free: true}', () => {
    let numeric = new Numeric({num: 3.14, free: true});
    numeric.should.has.property('num', 3.14);
    numeric.should.has.property('free', true);
  });

  it('Create numeric from 1e-15', () => {
    let numeric = new Numeric(1e-15);
    numeric.should.has.property('num', 1e-15);
  });

  it('Wrong input', () => {
    should.throws(() => {
      new Numeric();
    });
    should.throws(() => {
      new Numeric('a');
    });
    should.throws(() => {
      new Numeric('1');
    });
    should.throws(() => {
      new Numeric({xxx: 12});
    });
    should.throws(() => {
      new Numeric({num: 12, free: 1});
    });
  });

  it('Conversion to Q.', () => {
    let numeric1 = new Numeric(3.14);
    numeric1.toQ().should.be.deepEqual({
      num: 3.14
    });
    let numeric2 = new Numeric({num: 3.14, free: true});
    numeric2.toQ().should.be.deepEqual({
      num: 3.14,
      free: true
    });
  });

  it('Conversion to CMathML.', () => {
    new Numeric(1.1)
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1.1</cn></math>');

    new Numeric(1e-15)
      .toCMathML.should.be
      .equal('<math xmlns="http://www.w3.org/1998/Math/MathML"><cn>1e-15</cn></math>');
  });
});
