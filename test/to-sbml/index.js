/* global describe, it */
const fs = require('fs');
const path = require('path');
const firstModel = require('./first-model');
const compartmentModel = require('./compartment-model');
const { Container } = require('../../src');

const chai = require('chai');
chai.should();
const chaiXml = require('chai-xml');
chai.use(chaiXml);

const first_model_result = fs.readFileSync(
  path.resolve(__dirname, './first-model-result.xml'),
  'utf8'
);
const two_compartment_model_result = fs.readFileSync(
  path.resolve(__dirname, './two-compartment-model-result.xml'),
  'utf8'
);

describe('Create SBML.', () => {

  it('First model', () => {
    let c = (new Container)
      .loadMany(firstModel)
      .populate(true);
    let text = c.select({id: 'sbml'})
      .do();
    // fs.writeFileSync('result.xml', text);
    text.should.xml.to.be.valid();
    text.should.xml.be.deep.equal(first_model_result);
  });

  it('Compartment model', () => {
    let c = (new Container)
      .loadMany(compartmentModel)
      .populate();
    let text = c.select({id: 'sbml'})
      .do();

    // fs.writeFileSync('result.xml', text);
    text.should.xml.to.be.valid();
    text.should.xml.be.deep.equal(two_compartment_model_result);
  });

});
