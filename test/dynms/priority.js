/* global describe, it */
const { expect } = require('chai');
const Ajv2020 = require('ajv/dist/2020');
const { Builder } = require('../../src');
const schema = require('../../src/dynms/dynms.schema.json');

const validateDynms = new Ajv2020({ strict: false, validateFormats: false }).compile(schema);

describe('DynMS export of event priority', () => {
  it('exports priority as a MathJSON expression', () => {
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

    let DynMSExport = builder.exportClasses.dynms;
    let document = JSON.parse(new DynMSExport().makeText()[0].content);
    let event = document.models[0].events.find((item) => item.id === 'sw');

    expect(event.priority).to.deep.equal(['Add', 'k', 1]);
    expect(validateDynms(document), validateDynms.errors).to.equal(true);
  });

  it('exports priority for every switcher type', () => {
    let builder = new Builder({
      id: 'event-priority-types',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'x', class: 'Record', assignments: { start_: 0, time: 1, discrete: 2, continuous: 3 } },
      { id: 'time', class: 'TimeSwitcher', start: 1, priority: '1 + 2' },
      { id: 'discrete', class: 'DSwitcher', trigger: 'true', priority: '1 + 2' },
      { id: 'continuous', class: 'CSwitcher', trigger: 'x', priority: '1 + 2' },
      { id: 'stop', class: 'StopSwitcher', trigger: 'true', priority: '1 + 2' }
    ]);

    let DynMSExport = builder.exportClasses.dynms;
    let document = JSON.parse(new DynMSExport().makeText()[0].content);
    let model = document.models[0];
    let events = model.timeEvents.concat(model.events);

    ['time', 'discrete', 'continuous', 'stop'].forEach((id) => {
      expect(events.find((event) => event.id === id).priority).to.deep.equal(['Add', 1, 2]);
    });
    expect(validateDynms(document), validateDynms.errors).to.equal(true);
  });
});
