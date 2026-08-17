/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');
const { SBMLParse } = require('../../src/module-system/sbml-parse');

describe('SBML export of special numbers', () => {
  it('writes SBML INF values and preserves them on import', () => {
    let builder = new Builder({
      id: 'special-numbers',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'positive', class: 'Const', num: Infinity },
      { id: 'negative', class: 'Const', num: -Infinity },
      { id: 'invalid', class: 'Const', num: NaN }
    ]);

    let SBMLExport = builder.exportClasses.sbml;
    let xml = new SBMLExport().makeText()[0].content;
    expect(xml).to.include('id="positive"');
    expect(xml).to.include('value="INF"');
    expect(xml).to.include('value="-INF"');
    expect(xml).to.include('value="NaN"');

    let qArr = SBMLParse(xml);
    expect(qArr.find((q) => q.id === 'positive').num).to.equal(Infinity);
    expect(qArr.find((q) => q.id === 'negative').num).to.equal(-Infinity);
    expect(qArr.find((q) => q.id === 'invalid').num).to.be.NaN;
  });
});
