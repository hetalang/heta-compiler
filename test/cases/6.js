/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');
const chaiXml = require('chai-xml');
use(chaiXml);
const fs = require('fs-extra');

const sbml_correct = fs.readFileSync('cases/6-import/master/output_sbml/model.xml','utf8')
  .replace(/<hetalang:hasMeta.*<\/hetalang:hasMeta>/, ''); // to skip sbml/annotation comparison
const json_correct = require('../../cases/6-import/master/output_json/output.heta.json');

describe('Testing "cases/6-import"', () => {
  let b;
  let exportArray;

  it('Create builder.', () => {
    let declaration = {
      id: 'test',
      builderVersion: '*',
      options: {
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      },
      export: [
        {format: 'SBML', spaceFilter: 'model'},
      ]
    };
    process.chdir('cases/6-import');
    b = new Builder(declaration, fs.readFileSync, () => {});
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
    process.chdir('../..');
    exportArray = b.exportArray;
  });

  it('Run @SBMLExport, check and compare.', () => {
    let sbml_export = exportArray[0];
    let code = sbml_export.makeText()[0].content;
    expect(code).xml.to.to.be.valid();
    // to skip sbml/annotation comparison
    code = code.replace(/<hetalang:hasMeta.*<\/hetalang:hasMeta>/, '');
    expect(code).xml.be.deep.equal(sbml_correct);
    //console.log(code);
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.exportClasses.JSON;
    let json_export = new JSONExport({spaceFilter: 'model', filepath: 'xxx'});
    expect(json_export).not.to.have.property('errored', true);

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code).slice(1); // remove meta
    expect(obj).to.be.deep.equal(json_correct.slice(1));
    //console.log(obj);
  });
});
  