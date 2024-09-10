/*global describe, it*/
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const { Logger } = require('../../src/logger');
const path = require('path');
const expected = require('./expected');
const noImportOutput = require('./no-include');
const fs = require('fs');

// create logger
let logger = new Logger();

describe('ModuleSystem without include.', () => {
  it('Add module.', () => {
    let ms = new ModuleSystem(logger, (filename) => fs.readFileSync(filename));
    let filepath = path.join(__dirname, 'no-include.heta');
    let mdl = ms.addModuleDeep(filepath, 'heta', {});
    
    expect(mdl).to.be.deep.equal(noImportOutput);
  });
});

describe('Run normal ModuleSystem.', () => {
  it('Add module.', () => {
    let ms = new ModuleSystem(logger, (filename) => fs.readFileSync(filename));
    let filepath = path.join(__dirname, './normal-a.heta');
    let mdl = ms.addModuleDeep(filepath, 'heta', {});

    expect(mdl).to.be.with.a('Array').lengthOf(3);

    expect(Object.keys(ms.moduleCollection)).to.have.property('length', 5);
    expect(Object.keys(ms.graph.map)).to.have.property('length', 5);

    let arr = ms.integrate();
    expect(arr).to.be.deep.equal(expected);
  });
});
