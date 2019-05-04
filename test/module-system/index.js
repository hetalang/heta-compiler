/*global describe, it*/
const { expect } = require('chai');
const ModuleSystem = require('../../src/module-system');
const path = require('path');
// const { writeFileSync } = require('fs');
const expected = require('./expected');
const noImportOutput = require('./no-import');

describe('ModuleSystem without import.', () => {
  let ms = new ModuleSystem();

  it('Add module.', (done) => {
    let filepath = path.join(__dirname, 'no-import.heta');
    ms.addModuleDeepAsync(filepath, 'heta', {}, (err, mdl) => {
      if(err){
        done(err);
      }else{
        expect(mdl.parsed).to.be.deep.equal(noImportOutput);
        done();
      }
    });
  });
});


describe('Run normal ModuleSystem.', () => {
  let ms;

  it('Add module.', (done) => {
    ms = new ModuleSystem();
    let filepath = path.join(__dirname, './normal-a.heta');
    ms.addModuleDeepAsync(filepath, 'heta', {}, (err, mdl) => {
      if(err){
        done(err);
      }else{
        expect(mdl).to.have.property('filename').with.a('string');
        expect(mdl).to.have.property('type', 'heta');
        expect(mdl).to.have.property('parsed').with.a('Array').lengthOf(3);

        let arr = ms.integrate();
        // writeFileSync('arr.json', JSON.stringify(arr, null, 2));
        expect(arr).to.be.deep.equal(expected);
        done();
      }
    });
  });
});
