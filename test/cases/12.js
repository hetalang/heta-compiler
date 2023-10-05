/* global describe, it */
const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
//const { safeLoad } = require('js-yaml');
const fs = require('fs-extra');
//const { slvParse } = require('slv-utils');

const sbml_correct = fs.readFileSync('cases/12-to-sbml/master/sbml/first.xml','utf8');
const json_correct = require('../../cases/12-to-sbml/master/output.json');

describe('Testing "cases/12-to-sbml"', () => {
  let b;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
        logLevel: 'panic',
        skipExport: true
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      }
    };
    b = new Builder(declaration, 'cases/12-to-sbml');
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
  });

  it('Run @SBMLExport, check and compare.', () => {
    const SBMLExport = b.container.classes.SBML;
    let sbml_export = new SBMLExport({spaceFilter: 'first'});

    let code = sbml_export.makeText()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.container.classes.JSON;
    let json_export = new JSONExport({spaceFilter: 'first'});

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });

});
