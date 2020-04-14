/* global describe, it */
const { Builder } = require('../../src');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
//const { safeLoad } = require('js-yaml');
const fs = require('fs-extra');
//const { slvParse } = require('slv-utils');

const sbml_correct = fs.readFileSync('cases/12-to-sbml/master/sbml.xml','utf8');
const json_correct = require('../../cases/12-to-sbml/master/output.json');

describe('Testing "cases/12-to-sbml"', () => {
  let b;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '^0.4.21',
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
    const SBMLExport = b.container.exports.SBML;
    let sbml_export = new SBMLExport;
    sbml_export.namespace = b.container.namespaces.get('first');

    let code = sbml_export.make()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.container.exports.JSON;
    let json_export = new JSONExport;
    json_export._id = 'json_export';
    json_export.namespace = b.container.namespaces.get('first');

    let code = json_export.make()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });

});
