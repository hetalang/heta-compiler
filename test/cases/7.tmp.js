/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const fs = require('fs-extra');

//const sbml_correct = fs.readFileSync('cases/7-importNS/master/output_sbml.xml','utf8');
const json_correct = require('../../cases/7-importNS/master/output_json.json');

describe('Testing "cases/7-importNS"', () => {
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
    b = new Builder(declaration, 'cases/7-importNS');
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
  });
/*
  it('Run @SBMLExport, check and compare.', () => {
    let sbml_export = b.container.select({id: 'output_sbml', space: 'two'});
    let code = sbml_export.make()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });
*/
  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.container._componentClasses.JSONExport;
    let json_export = new JSONExport;
    json_export._id = 'output_json';
    json_export.namespace = b.container.namespaceStorage.get('two');

    let code = json_export.make()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });
});
  