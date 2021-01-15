/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const fs = require('fs-extra');

const sbml_correct = fs.readFileSync('cases/6-import/master/output_sbml.xml','utf8');
const json_correct = require('../../cases/6-import/master/output_json.json');

describe('Testing "cases/6-import"', () => {
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
    b = new Builder(declaration, 'cases/6-import');
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
  });

  it('Run @SBMLExport, check and compare.', () => {
    let sbml_export = b.container.exportStorage[0];
    let code = sbml_export.make()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.container.exports.JSON;
    let json_export = new JSONExport;
    json_export.container = b.container;
    json_export.merge({spaceFilter: 'model'});

    let code = json_export.make()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });
});
  