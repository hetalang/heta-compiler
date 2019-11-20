/*global describe, it */
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
const { ModuleError } = require('../../src/heta-error');

describe('ModuleSystem for cyclic.', () => {
  it('Add cyclic module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, './cycle-a.heta');
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    expect(Object.keys(ms.moduleCollection)).to.have.lengthOf(3);
    expect(() => {
      ms.sortedPaths();
    }).to.throw(ModuleError);
  });
});

describe('ModuleSystem with self include.', () => {
  it('Add module. Sort throws.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, 'self-include.heta');
    await ms.addModuleDeepAsync(filepath, 'heta', {});
    expect(() => {
      ms.sortedPaths();
    }).to.throw(ModuleError);
  });
});
