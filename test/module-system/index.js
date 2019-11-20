/*global describe, it*/
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
//const { writeFileSync } = require('fs');
const expected = require('./expected');
const noImportOutput = require('./no-include');

describe('ModuleSystem without include.', () => {
  it('Add module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, 'no-include.heta');
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    
    expect(mdl.parsed).to.be.deep.equal(noImportOutput);
  });
});

describe('Run normal ModuleSystem.', () => {
  it('Add module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, './normal-a.heta');
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    //writeFileSync('res0-new.json', JSON.stringify(ms, null, 2));

    expect(mdl).to.have.property('filename').with.a('string');
    expect(mdl).to.have.property('type', 'heta');
    expect(mdl).to.have.property('parsed').with.a('Array').lengthOf(3);

    expect(Object.keys(ms.moduleCollection)).to.have.property('length', 5);
    expect(Object.keys(ms.graph.map)).to.have.property('length', 5);

    let arr = ms.integrate();
    //writeFileSync('res-new.json', JSON.stringify(arr, null, 2));
    expect(arr).to.be.deep.equal(expected);
  });
});
