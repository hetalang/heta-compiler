/* global describe, it */
const fs = require('fs');
const path = require('path');
const { Builder } = require('../../src');
const hetaLoader = require('../../src/module-system/heta-module');
const { expect } = require('chai');

const fixtureDir = __dirname;

describe('HetaCode export', () => {
  it('exports a rich model as minimal parseable Heta code', () => {
    let sourceBuilder = buildFromFile('rich-model.heta');
    let expectedBuilder = buildFromFile('rich-model.expected.heta');

    let hetaExport = new sourceBuilder.exportClasses.hetacode();
    let exportedCode = hetaExport.makeText()[0].content;
    let exportedBuilder = buildFromCode(exportedCode);

    expect(exportedCode).not.to.match(/,\s*[}\]]/);
    expect(exportedCode).not.to.match(/\{\s*\}/);
    expect(exportedCode).to.include("'''main compartment note'''");
    expect(exportedCode).to.include('scaleFactor @Const = 1;');

    expect(exportedCode).to.include('helperFun #defineFunction');
    expect(exportedCode).to.include('usedFun #defineFunction');
    expect(exportedCode).not.to.include('unusedFun #defineFunction');

    expect(exportedCode).to.include('helperUnit #defineUnit');
    expect(exportedCode).to.include('usedUnit #defineUnit');
    expect(exportedCode).to.include('rateUnit #defineUnit');
    expect(exportedCode).not.to.include('unusedUnit #defineUnit');

    expect(exportedBuilder.container.makeCanonicalObject())
      .to.deep.equal(expectedBuilder.container.makeCanonicalObject());
  });
});

function buildFromFile(filename) {
  return buildFromCode(fs.readFileSync(path.join(fixtureDir, filename), 'utf8'));
}

function buildFromCode(code) {
  let b = new Builder();
  b.container.loadMany(hetaLoader(code));
  b.container.knitMany();
  b.container.checkCircRecord();
  b.container.checkCircUnitDef();
  b.container.checkCircFunctionDef();

  expect(b.container.logger).to.have.property('hasErrors').false;

  return b;
}
