/*global describe, it*/
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
// const { writeFileSync } = require('fs');
const expected = require('./expected');

let ms = new ModuleSystem();

describe('Run normal ModuleSystem.', () => {
  let ms;
  it('Create.', () => {
    ms = new ModuleSystem();
  });
  it('Add module.', () => {
    let filepath = path.join(__dirname, './normal-a.heta');
    let mdl = ms.addModuleDeep(filepath, 'heta');
    expect(mdl).to.have.property('filename').with.a('string');
    expect(mdl).to.have.property('type', 'heta');
    expect(mdl).to.have.property('parsed').with.a('Array').lengthOf(3);
  });

  it('Integrate and check.', () => {
    let arr = ms.integrate();
    // writeFileSync('arr.json', JSON.stringify(arr, null, 2));
    expect(arr).to.be.deep.equal(expected);
  });
});
