/*global describe, it */
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
const { Logger } = require('../../src/logger');
const fs = require('fs');

// create logger
let logger = new Logger();

describe('ModuleSystem for cyclic.', () => {
  it('Add cyclic module.', () => {
    let ms = new ModuleSystem(logger, (filename) => fs.readFileSync(filename, 'utf8'));
    let filepath = path.join(__dirname, './cycle-a.heta');
    ms.addModuleDeep(filepath, 'heta', {});
    expect(Object.keys(ms.moduleCollection)).to.have.lengthOf(3);
    expect(() => {
      ms.sortedPaths();
    }).to.throw(Error);
  });
});

describe('ModuleSystem with self include.', () => {
  it('Add module. Sort throws.', () => {
    let ms = new ModuleSystem(logger, (filename) => fs.readFileSync(filename, 'utf8'));
    let filepath = path.join(__dirname, 'self-include.heta');
    ms.addModuleDeep(filepath, 'heta', {});
    expect(() => {
      ms.sortedPaths();
    }).to.throw(Error);
  });
});
