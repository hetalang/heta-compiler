/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');

describe('SBML export of event priority', () => {
  it('exports numeric priority only for SBML L3V1 and newer', () => {
    let builder = new Builder({
      id: 'event-priority',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'x', class: 'Record', assignments: { start_: 0, sw: 1 } },
      { id: 'sw', class: 'DSwitcher', trigger: 'true', priority: -2.5 }
    ]);

    let SBMLExport = builder.exportClasses.sbml;
    let l2 = new SBMLExport({ version: 'L2V4' }).makeText()[0].content;
    let l3v1 = new SBMLExport({ version: 'L3V1' }).makeText()[0].content;
    let l3v2 = new SBMLExport({ version: 'L3V2' }).makeText()[0].content;

    expect(l2).not.to.include('<priority>');
    expect(l3v1).to.include('<priority>');
    expect(l3v1).to.include('<cn>-2.5</cn>');
    expect(l3v2).to.include('<priority>');
    expect(l3v2).to.include('<cn>-2.5</cn>');
  });

  it('omits priority when it is not set', () => {
    let builder = new Builder({
      id: 'event-without-priority',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'x', class: 'Record', assignments: { start_: 0, sw: 1 } },
      { id: 'sw', class: 'DSwitcher', trigger: 'true' }
    ]);

    let SBMLExport = builder.exportClasses.sbml;
    let xml = new SBMLExport({ version: 'L3V1' }).makeText()[0].content;
    expect(xml).not.to.include('<priority>');
  });
});
