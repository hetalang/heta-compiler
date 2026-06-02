/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect } = require('chai');
const fs = require('fs-extra');

const json_correct = require('../../cases/6-import/master/json/output.heta.json');

describe('Testing "cases/6-import"', () => {
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
      },
      export: []
    };
    process.chdir('cases/6-import');
    b = new Builder(declaration, fs.readFileSync, () => {});
    //console.log(b);
  });

  it('Run include', () => {
    b.run();
    process.chdir('../..');
  });

  it('Run @JSONExport, check and compare.', () => {
    const JSONExport = b.exportClasses['json'];
    let json_export = new JSONExport({spaceFilter: 'model', filepath: 'xxx'});
    expect(json_export).not.to.have.property('errored', true);

    let code = json_export.makeText()[0].content;
    let obj = JSON.parse(code).slice(1); // remove meta
    expect(obj).to.be.deep.equal(json_correct.slice(1));
    //console.log(obj);
  });
});
