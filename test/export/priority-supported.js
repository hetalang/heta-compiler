/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');

function createBuilder() {
  let builder = new Builder({
    id: 'event-priority',
    builderVersion: '*',
    options: {},
    importModule: { type: 'heta', source: 'unused.heta' },
    export: []
  });
  builder.container.loadMany([
    { id: 'priorityValue', action: 'defineFunction', arguments: [], math: '2' },
    { id: 'x', class: 'Record', assignments: { start_: 0, sw: 1 } },
    { id: 'sw', class: 'TimeSwitcher', start: 1, priority: 'priorityValue()' }
  ]);
  builder.container.knitMany();
  builder.container.defaultLogs.length = 0;

  return builder;
}

describe('Exporting supported event priority', () => {
  it('preserves priority in the internal serializations', () => {
    let builder = createBuilder();

    let canonical = new builder.exportClasses.canonical({}).makeText()[0].content;
    let json = new builder.exportClasses.json({}).makeText()[0].content;
    let yaml = new builder.exportClasses.yaml({}).makeText()[0].content;
    let heta = new builder.exportClasses.hetacode({}).makeText()[0].content;
    let table = new builder.exportClasses.table({}).makeSheet()[0].content;

    expect(canonical).to.include('"priority": "priorityValue()"');
    expect(json).to.include('"priority": "priorityValue()"');
    expect(yaml).to.include('priority: priorityValue()');
    expect(heta).to.include('#defineFunction { arguments: [], math: 2 }');
    expect(heta).to.include('priority: priorityValue()');
    expect(table.find((row) => row.id === 'sw')).to.include({priority: 'priorityValue()'});
    expect(builder.container.defaultLogs.filter((log) => log.level === 'warn')).to.have.lengthOf(0);
  });
});
