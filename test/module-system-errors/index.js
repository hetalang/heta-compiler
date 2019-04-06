/*global describe, it */
const should = require('chai').should();
const ModuleSystem = require('../../src/module-system');
const path = require('path');

describe('ModuleSystem for cyclic.', () => {
  let ms;
  it('create ModuleSystem', () => {
    ms = new ModuleSystem();
  });

  it('Add cyclic module.', () => {
    let filepath = path.join(__dirname, './cycle-a.heta');
    ms.addModuleDeep(filepath, 'heta');
    Object.keys(ms.storage).should.have.lengthOf(3);
  });

  it('Sort throws because it is cyclic', () => {
    should.Throw(() => {
      ms.sortedPaths();
    });
  });
});

describe('ModuleSystem with self import.', () => {
  let ms = new ModuleSystem();
  it('Add module.', () => {
    let filepath = path.join(__dirname, 'self-import.heta');
    ms.addModuleDeep(filepath, 'heta');
  });
  it('Sort throws.', () => {
    should.Throw(() => {
      ms.sortedPaths();
    });
  });
});
