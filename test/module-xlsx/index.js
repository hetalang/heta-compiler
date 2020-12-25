/*global describe, it*/
const { expect } = require('chai');
const { Builder } = require('../../src/builder');
const outputNameless = require('./output-nameless');
const outputOne = require('./output-one');

describe('Integral test of correct xlsx module', () => {
  it('Create platform for single XLSX sheet.', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'panic' },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 1,
        omitRows: 2
      }
    };
    let b = new Builder(declaration, __dirname);
    b.run();
    let resultNameless = b.container.namespaces.get('nameless').toQArr(true);
    expect(resultNameless).to.be.deep.equal(outputNameless);
    let resultOne = b.container.namespaces.get('one').toQArr(true);
    expect(resultOne).to.be.deep.equal(outputOne);
  });

  it('Create platform for two XLSX sheets.', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'panic' },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 2
      }
    };
    let b = new Builder(declaration, __dirname);
    b.run();
    let resultNameless = b.container.namespaces.get('nameless').toQArr(true);
    expect(resultNameless).to.be.deep.equal(outputNameless);
  });

  it('Create platform for empty XLSX sheets: error', () => {
    let declaration = {
      id: 'test',
      title: 'Test',
      builderVersion: '>=0.4',
      options: { logLevel: 'panic', debug: false },
      importModule: {
        type: 'xlsx',
        source: 'table.xlsx',
        sheet: 10
      }
    };
    let b = new Builder(declaration, __dirname);
    
    b.run();
    expect(b.container.hetaErrors()).to.be.lengthOf(1);
  });
});
