/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');

describe('DynMS scenarios', () => {
  it('exports Heta scenarios with optional overrides', () => {
    const builder = new Builder({
      id: 'scenario-export',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'k', class: 'Const', num: 1 },
      { id: 'x', class: 'Record', assignments: { start_: 0 } },
      { id: 'dose', class: 'TimeSwitcher', start: 1 },
      {
        id: 'run',
        action: 'setScenario',
        tspan: [0, 24],
        parameters: { k: 2 },
        saveat: [0, 12, 24],
        observables: ['x'],
        events_active: { dose: false },
        events_save: { dose: [true, false] }
      }
    ]);
    builder.container.knitMany();

    const DynMSExport = builder.exportClasses.dynms;
    const document = JSON.parse(new DynMSExport().makeText()[0].content);

    expect(document.scenarios).to.deep.equal([{
      id: 'run',
      model: 'nameless',
      tspan: [0, 24],
      parameters: { k: 2 },
      saveat: [0, 12, 24],
      observables: ['x'],
      eventsActive: { dose: false },
      eventsSave: { dose: [true, false] }
    }]);
  });
});
