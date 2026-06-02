/* global describe, it */
const { Builder } = require('../../src/builder');
const { expect } = require('chai');
const fs = require('fs-extra');

const json_correct = require('../../cases/12-to-sbml/master/json/output.heta.json');

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

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.exportClasses['json'];
    let json_export = new JSONExport({spaceFilter: 'first', filepath: 'xxx', useUnitsExpr: true});
    expect(json_export).not.to.has.property('errored', true);

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code).slice(1); // skip meta
    expect(obj).to.be.deep.equal(json_correct.slice(1));
  });

});
