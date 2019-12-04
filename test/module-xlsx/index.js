/*global describe, it*/
const { expect } = require('chai');
const { Builder, BuilderError } = require('../../src/builder');
//const path = require('path');
//const { writeFileSync } = require('fs');
const output = require('./output');
//const noImportOutput = require('./no-include');

describe('Integral test of correct xlsx module', () => {
  it('Create platform for single XLSX.', async () => {
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
    let result = b.container.toQArr();
    expect(result).to.be.deep.equal(output);
  });

  it('Create platform for two XLSX.', async () => {
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
    let result = b.container.toQArr();
    expect(result).to.be.deep.equal(output);
  });
});
