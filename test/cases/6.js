/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const fs = require('fs-extra');

const sbml_correct = fs.readFileSync('cases/6-import/master/output_sbml/model.xml','utf8');
const json_correct = require('../../cases/6-import/master/output_json.json');

describe('Testing "cases/6-import"', () => {
  let b;
  let exportArray;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
        logLevel: 'panic'
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      },
      export: null
    };
    b = new Builder(declaration, 'cases/6-import');
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
    exportArray = b.exportArray;
  });

  it('Run @SBMLExport, check and compare.', () => {
    let sbml_export = exportArray[0];
    let code = sbml_export.makeText()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.exportClasses.JSON;
    let json_export = new JSONExport({spaceFilter: 'model', filepath: 'xxx'});
    expect(json_export).not.to.have.property('errored', true);

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
    //console.log(obj);
  });
});
  