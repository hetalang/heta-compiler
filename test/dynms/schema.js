/* global describe, it */
const { expect } = require('chai');
const Ajv2020 = require('ajv/dist/2020');

const schema = require('../../src/dynms/dynms.schema.json');

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  validateFormats: false,
});
const validateDynms = ajv.compile(schema);

describe('DynMS schema', () => {
  it('accepts supported MathJSON functions', () => {
    const doc = makeDoc(['Add', 'x', ['Sin', 't']]);

    expect(validateDynms(doc)).to.equal(true);
  });

  it('rejects unsupported DynMS versions', () => {
    const doc = makeDoc(['Add', 'x', ['Sin', 't']]);
    doc.dynms = '0.2.0';

    expect(validateDynms(doc)).to.equal(false);
  });

  it('rejects unsupported MathJSON functions in array form', () => {
    const doc = makeDoc(['UnsupportedFunction', 'x']);

    expect(validateDynms(doc)).to.equal(false);
  });

  it('rejects unsupported MathJSON functions in fn object form', () => {
    const doc = makeDoc({ fn: ['UnsupportedFunction', 'x'] });

    expect(validateDynms(doc)).to.equal(false);
  });

  it('accepts custom symbols as MathJSON strings', () => {
    const doc = makeDoc('customSymbol');

    expect(validateDynms(doc)).to.equal(true);
  });
});

function makeDoc(expr) {
  return {
    dynms: '0.1.0',
    models: [
      {
        id: 'model',
        constants: [],
        states: [
          {
            id: 'x',
            initial: 0
          }
        ],
        assignments: [
          {
            id: 'y',
            rhs: {
              expr,
              format: 'math-json'
            }
          }
        ],
        derivatives: [
          {
            state: 'x',
            rhs: {
              expr: 0,
              format: 'math-json'
            }
          }
        ],
        events: [],
        observables: []
      }
    ]
  };
}
