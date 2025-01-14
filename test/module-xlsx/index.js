/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
const outputNameless = require('./output-nameless');
const outputOne = require('./output-one');
const fs = require('fs-extra');

describe('Integral test of correct xlsx module', () => {
  it('Create platform for single XLSX sheet.', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: {
      },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 0,
        omitRows: 2
      }
    };
    process.chdir(__dirname);
    let b = new Builder(declaration, fs.readFileSync, () => {});
    b.run();
    process.chdir('../..');
    let resultNameless = b.container.namespaceStorage.get('nameless').toQArr(true);
    expect(resultNameless).to.be.deep.equal(outputNameless);
    let resultOne = b.container.namespaceStorage.get('one').toQArr(true);
    expect(resultOne).to.be.deep.equal(outputOne);
  });

  it('Create platform for two XLSX sheets.', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: {
      },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 1
      }
    };
    process.chdir(__dirname);
    let b = new Builder(declaration, fs.readFileSync, () => {});
    b.run();
    process.chdir('../..');
    let resultNameless = b.container.namespaceStorage.get('nameless').toQArr(true);
    expect(resultNameless).to.be.deep.equal(outputNameless);
  });

  it('Create platform for empty XLSX sheets: error', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { debug: false },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 9
      }
    };
    process.chdir(__dirname);
    let b = new Builder(declaration, fs.readFileSync, () => {});
    b.run();
    process.chdir('../..');
    expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
});
