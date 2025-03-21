/* global describe, it */
const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const fs = require('fs-extra');

const sbml_correct = fs.readFileSync('cases/12-to-sbml/master/sbml/first.xml','utf8');
const json_correct = require('../../cases/12-to-sbml/master/output.json');

describe('Testing "cases/12-to-sbml"', () => {
  let b;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      }
    };
    process.chdir('cases/12-to-sbml');
    b = new Builder(declaration, fs.readFileSync, () => {});
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
    process.chdir('../..');
  });

  it('Run @SBMLExport, check and compare.', () => {
    const SBMLExport = b.exportClasses.SBML;
    let sbml_export = new SBMLExport({spaceFilter: 'first', filepath: 'yyy'});
    expect(sbml_export).not.to.has.property('errored', true);

    let code = sbml_export.makeText()[0].content;
    expect(code).xml.to.to.be.valid();
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.exportClasses.JSON;
    let json_export = new JSONExport({spaceFilter: 'first', filepath: 'xxx'});
    expect(json_export).not.to.has.property('errored', true);

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
  });

});
