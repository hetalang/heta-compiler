/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
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
        omitRows: 2
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
        sheet: 2
      }
    };
    let b = new Builder(declaration, __dirname);
    await b.runAsync();
    let result = b.container.toQArr(true);
    expect(result).to.be.deep.equal(output);
  });

  it('Create platform for empty XLSX sheets: error', function(done) {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error', debuggingMode: false },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 10
      }
    };
    let b = new Builder(declaration, __dirname);
    
    b.runAsync()
      .then(() => done(new Error('Wrong sheet should throw.')))
      .catch((err) => {
        // i am not sure know if it is the correct way to check error instance
        if(err instanceof Error){
          done();
        }else{
          done(new Error('Error must be of instance Error'));
        }
      });
  });
});
