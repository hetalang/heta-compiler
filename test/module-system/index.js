/*global describe, it*/
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
// const { writeFileSync } = require('fs');
const expected = require('./expected');
const noImportOutput = require('./no-import');

describe('ModuleSystem without import.', () => {
  it('Add module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, 'no-import.heta');
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    
    expect(mdl.parsed).to.be.deep.equal(noImportOutput);
  });
});

describe('Run normal ModuleSystem.', () => {
  it('Add module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, './normal-a.heta');
    console.log('RUN index.js > 1')
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    console.log('RUN index.js > 2')
    console.log(mdl)

    expect(mdl).to.have.property('filename').with.a('string');
    expect(mdl).to.have.property('type', 'heta');
    expect(mdl).to.have.property('parsed').with.a('Array').lengthOf(3);

    //let arr = ms.integrate();
    //writeFileSync('arr.json', JSON.stringify(arr, null, 2));
    //expect(arr).to.be.deep.equal(expected);
  });
});
