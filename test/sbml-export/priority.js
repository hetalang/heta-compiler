/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');

describe('SBML export of event priority', () => {
  it('exports expression priority only for SBML L3V1 and newer', () => {
    let builder = new Builder({
      id: 'event-priority',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'k', class: 'Const', num: 2 },
      { id: 'x', class: 'Record', assignments: { start_: 0, sw: 1 } },
      { id: 'sw', class: 'DSwitcher', trigger: 'true', priority: 'k + 1' }
    ]);

    let SBMLExport = builder.exportClasses.sbml;
    let l2 = new SBMLExport({ version: 'L2V4' }).makeText()[0].content;
    let l2Warnings = builder.container.defaultLogs.filter((log) => log.level === 'warn');
    expect(l2Warnings).to.have.lengthOf(1);
    expect(l2Warnings[0].msg).to.include('does not support event priority');
    builder.container.defaultLogs.length = 0;

    let l3v1 = new SBMLExport({ version: 'L3V1' }).makeText()[0].content;
    let l3v2 = new SBMLExport({ version: 'L3V2' }).makeText()[0].content;

    expect(l2).not.to.include('<priority>');
    expect(l3v1).to.include('<priority>');
    expect(l3v1).to.include('<plus/>');
    expect(l3v1).to.include('<ci>k</ci>');
    expect(l3v2).to.include('<priority>');
    expect(l3v2).to.include('<plus/>');
    expect(l3v2).to.include('<ci>k</ci>');
    expect(builder.container.defaultLogs
      .filter((log) => log.level === 'warn' && log.msg.includes('event priority')))
      .to.have.lengthOf(0);
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

  it('exports priority for every supported switcher type in Level 3', () => {
    let builder = new Builder({
      id: 'supported-priority-types',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'k', class: 'Const', num: 2 },
      { id: 'x', class: 'Record', assignments: { start_: 0, time: 1, discrete: 2, continuous: 3 } },
      { id: 'time', class: 'TimeSwitcher', start: 1, priority: 'k + 1' },
      { id: 'discrete', class: 'DSwitcher', trigger: 'true', priority: 'k + 1' },
      { id: 'continuous', class: 'CSwitcher', trigger: 'x', priority: 'k + 1' }
    ]);

    let SBMLExport = builder.exportClasses.sbml;
    let xml = new SBMLExport({ version: 'L3V2' }).makeText()[0].content;

    expect((xml.match(/<priority>/g) || [])).to.have.lengthOf(3);
    expect((xml.match(/<ci>k<\/ci>/g) || [])).to.have.lengthOf(3);
    expect(builder.container.defaultLogs
      .filter((log) => log.level === 'warn' && log.msg.includes('event priority')))
      .to.have.lengthOf(0);
  });

  it('warns when Level 3 omits StopSwitcher priority', () => {
    let builder = new Builder({
      id: 'stop-priority',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.load({ id: 'stop', class: 'StopSwitcher', trigger: 'true', priority: 1 });
    builder.container.defaultLogs.length = 0;

    let SBMLExport = builder.exportClasses.sbml;
    let xml = new SBMLExport({ version: 'L3V2' }).makeText()[0].content;
    let warnings = builder.container.defaultLogs.filter((log) => log.level === 'warn');

    expect(xml).not.to.include('<priority>');
    expect(warnings).to.have.lengthOf(1);
    expect(warnings[0].msg).to.include('does not support event priority');
  });
});
