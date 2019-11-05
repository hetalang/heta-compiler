/*global describe, it */
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');

describe('ModuleSystem for cyclic.', () => {

  it('Add cyclic module.', async () => {
    let ms = new ModuleSystem();
    let filepath = path.join(__dirname, './cycle-a.heta');
    let mdl = await ms.addModuleDeepAsync(filepath, 'heta', {});
    expect(Object.keys(ms.moduleCollection)).to.have.lengthOf(3);
  });

  it('Sort throws because it is cyclic', () => {
    expect(() => ms.sortedPaths()).to.throw();
  });
});

describe('ModuleSystem with self import.', () => {
  let ms = new ModuleSystem();
  it('Add module.', async () => {
    let filepath = path.join(__dirname, 'self-import.heta');
    await ms.addModuleDeepAsync(filepath, 'heta', {});
  });
  it('Sort throws.', () => {
    expect(() => ms.sortedPaths()).to.throw();
  });
});
