/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
const { ModuleError } = require('../../src/heta-error');
const output = require('./output');

describe('Integral test of correct xlsx module', () => {
  it('Create platform for single XLSX sheet.', async () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error' },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 1,
        omitRows: 2,
        waitSec: 5
      }
    };
    let b = new Builder(declaration, __dirname);
    await b.runAsync();
    let result = b.container.toQArr(true);
    expect(result).to.be.deep.equal(output);
  });

  it('Create platform for two XLSX sheets.', async () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error' },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 2,
        waitSec: 5
      }
    };
    let b = new Builder(declaration, __dirname);
    await b.runAsync();
    let result = b.container.toQArr(true);
    expect(result).to.be.deep.equal(output);
  });
  
  it('Create platform for empty XLSX sheets: error', async function() {
    this.timeout(0);
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error', debuggingMode: true },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 10,
        waitSec: 5
      }
    };
    let b = new Builder(declaration, __dirname);
    
    try{
      await b.runAsync();
    }catch(err){
      expect(err).to.be.instanceOf(ModuleError);
      return null;
    }
    
    throw new Error('Wrong sheet should throw.');
  });

  /* The same as previously but solved using Promise syntax */
  /*
  it('Create platform for empty XLSX sheets: error', function(done) {
    this.timeout(7e3);
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error', debuggingMode: true },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 10,
        waitSec: 5
      }
    };
    let b = new Builder(declaration, __dirname);
    b.runAsync()
      .then(() => done(new Error('Wrong sheet should throw.')))
      .catch((err) => {
        // i don't know how to check error instance
        if(err instanceof ModuleError){
          done();
        }else{
          done(new Error('Error must be of instance ModuleError'));
        }
      });
  });
  */
});
