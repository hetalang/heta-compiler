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
});
