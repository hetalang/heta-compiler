/* global describe, it */
const fs = require('fs');
const path = require('path');
const firstModel = require('./first-model');
const compartmentModel = require('./compartment-model');
const { Container } = require('../../src');

const chai = require('chai');
const { expect } = chai;
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
    let text = c.select({id: 'sbml', space: 'first'}).do();
    //fs.writeFileSync('first-model-result-0.xml', text);
    expect(text).xml.to.be.valid();
    expect(text).xml.be.deep.equal(first_model_result);
  });

  it('Compartment model', () => {
    let c = (new Container)
      .loadMany(compartmentModel)
      .populate();
    let text = c.select({id: 'sbml', space: 'two_comp'})
      .do();

    //fs.writeFileSync('two-compartment-model-result-0.xml', text);
    expect(text).xml.to.be.valid();
    expect(text).xml.be.deep.equal(two_compartment_model_result);
  });

});
