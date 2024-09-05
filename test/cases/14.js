/* global describe, it */

const { Builder } = require('../../src/builder');
const { expect, use } = require('chai');

const json_correct = require('../../cases/14-sbml-module/master/output.json');

describe('Case #14: testing SBML module with units', () => {
  let b;

  it('Build platform', () => {
    b = new Builder({
      id: 'test',
      builderVersion: '*',
      options: {
        logLevel: 'panic',
        skipExport: true
      },
      importModule: {
        type: 'heta',
        source: 'src/index.heta'
      }
    }, 'cases/14-sbml-module');
    b.run();
    expect(b.container.logger).to.have.property('hasErrors').false;
  });

  it('compare JSON export', () => {
    let json_export = b.exportArray[0];
    let code = json_export.make(true)[0].content;
    let obj = JSON.parse(code);
    expect(obj).to.be.deep.equal(json_correct);
  });
});