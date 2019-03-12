/* global describe, it */
const fs = require('fs');
const firstModel = require('./first_model');
const Container = require('../../src');

const chai = require('chai');
chai.should();
const chaiXml = require('chai-xml');
chai.use(chaiXml);

const result = fs.readFileSync('./result.xml', 'utf8');

describe('Create SBML.', () => {

  let c;
  it('First model', () => {
    c = new Container();
    c.importMany(firstModel);
    let text = c.toSBML();

    text.should.xml.to.be.valid();
    text.should.xml.be.deep.equal(result);

    //fs.writeFileSync('result.xml', text);
  });

});
