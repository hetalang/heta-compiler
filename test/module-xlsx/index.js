/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
//const { ModuleError } = require('../../src/heta-error');
const output = require('./output');

// TODO: unresolved promise here
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
    let result = b.container.toQArr();
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
    let result = b.container.toQArr();
    expect(result).to.be.deep.equal(output);
  });
  /*
  it('Create platform for empty XLSX sheets: error', async function() {
    //this.timeout(0);
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'error', debuggingMode: false },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 10,
        waitSec: 5
      }
    };
    let b = new Builder(declaration, __dirname);
    await expect(async () => await b.runAsync()).to.throw();
  });
*/
});
