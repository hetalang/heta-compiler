/* global describe, it */
const fs = require('fs');
const firstModel = require('./first_model');
const Container = require('../../src');

describe('Create SBML.', () => {

  let c;
  it('First model', () => {
    c = new Container();
    c.importMany(firstModel);
    let text = c.toSBML();
    fs.writeFileSync('result.xml', text);
  });

});
