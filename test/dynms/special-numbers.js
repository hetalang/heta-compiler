/* global describe, it */
const { expect } = require('chai');
const Ajv2020 = require('ajv/dist/2020');
const { Builder } = require('../../src');
const schema = require('../../src/dynms/dynms.schema.json');

const validateDynms = new Ajv2020({ strict: false, validateFormats: false }).compile(schema);

describe('DynMS export of special numbers', () => {
  it('writes special constants as MathJSON number objects', () => {
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

    let DynMSExport = builder.exportClasses.dynms;
    let document = JSON.parse(new DynMSExport().makeText()[0].content);
    let constants = new Map(document.models[0].constants.map((constant) => [constant.id, constant.value]));

    expect(constants.get('positive')).to.deep.equal({ num: '+Infinity' });
    expect(constants.get('negative')).to.deep.equal({ num: '-Infinity' });
    expect(constants.get('invalid')).to.deep.equal({ num: 'NaN' });
    expect(validateDynms(document), validateDynms.errors).to.equal(true);
  });

  it('writes special state initial values as MathJSON expressions', () => {
    let builder = new Builder({
      id: 'special-state-numbers',
      builderVersion: '*',
      options: {},
      importModule: { type: 'heta', source: 'unused.heta' },
      export: []
    });
    builder.container.loadMany([
      { id: 'finite', class: 'Record', assignments: { start_: '1.5' } },
      { id: 'positive', class: 'Record', assignments: { start_: 'Infinity' } },
      { id: 'negative', class: 'Record', assignments: { start_: '-Infinity' } },
      { id: 'invalid', class: 'Record', assignments: { start_: 'NaN' } }
    ]);

    let DynMSExport = builder.exportClasses.dynms;
    let document = JSON.parse(new DynMSExport().makeText()[0].content);
    let states = new Map([
      ...document.models[0].dynamic,
      ...document.models[0].static
    ].map((state) => [state.id, state.initial]));

    expect(states.get('finite')).to.equal(1.5);
    expect(states.get('positive')).to.deep.equal({ expr: { num: '+Infinity' }, format: 'math-json' });
    expect(states.get('negative')).to.deep.equal({ expr: { num: '-Infinity' }, format: 'math-json' });
    expect(states.get('invalid')).to.deep.equal({ expr: { num: 'NaN' }, format: 'math-json' });
    expect(validateDynms(document), validateDynms.errors).to.equal(true);
  });
});
