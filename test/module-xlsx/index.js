/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
const output = require('./output');

describe('Integral test of correct xlsx module', () => {
  it('Create platform for single XLSX sheet.', () => {
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
    b.run();
    let result = b.container.toQArr(true);
    expect(result).to.be.deep.equal(output);
  });

  it('Create platform for two XLSX sheets.', () => {
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
    b.run();
    let result = b.container.toQArr(true);
    expect(result).to.be.deep.equal(output);
  });

  it('Create platform for empty XLSX sheets: error', () => {
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
    
    b.run();
    expect(b.logger).to.have.property('hasErrors', true);
  });
});
