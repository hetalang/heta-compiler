/*global describe, it */
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');

describe('ModuleSystem for cyclic.', () => {
  let ms;
  it('create ModuleSystem', () => {
    ms = new ModuleSystem();
  });

  it('Add cyclic module.', (done) => {
    let filepath = path.join(__dirname, './cycle-a.heta');
    ms.addModuleDeepAsync(filepath, 'heta', {}, (err, mdl) => {
      if(err){
        done(err);
      }else{
        Object.keys(ms.moduleCollection).should.have.lengthOf(3);
        done();
      }
    });
  });

  it('Sort throws because it is cyclic', () => {
    expect(() => ms.sortedPaths()).to.throw();
  });
});

describe('ModuleSystem with self import.', () => {
  let ms = new ModuleSystem();
  it('Add module.', (done) => {
    let filepath = path.join(__dirname, 'self-import.heta');
    ms.addModuleDeepAsync(filepath, 'heta', {}, done);
  });
  it('Sort throws.', () => {
    expect(() => ms.sortedPaths()).to.throw();
  });
});
