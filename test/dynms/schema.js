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
    doc.dynms = '0.1.0';

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

  it('accepts algebraic dynamic states', () => {
    const doc = makeDoc(0);
    doc.models[0].dynamic[0].algebraic = true;

    expect(validateDynms(doc)).to.equal(true);
  });

  it('rejects algebraic flag on static states', () => {
    const doc = makeDoc(0);
    doc.models[0].static.push({ id: 'y', initial: 0, algebraic: true });

    expect(validateDynms(doc)).to.equal(false);
  });

  it('rejects expressions as constant values', () => {
    const doc = makeDoc(0);
    doc.models[0].constants.push({ id: 'k', value: ['Add', 1, 2] });

    expect(validateDynms(doc)).to.equal(false);
  });

  it('accepts MathJSON special numbers as constant values', () => {
    const doc = makeDoc(0);
    doc.models[0].constants.push(
      { id: 'infinite', value: { num: 'Infinity' } },
      { id: 'positive', value: { num: '+Infinity' } },
      { id: 'negative', value: { num: '-Infinity' } },
      { id: 'invalid', value: { num: 'NaN' } }
    );

    expect(validateDynms(doc)).to.equal(true);
  });

  it('rejects unsupported MathJSON number-object values', () => {
    const doc = makeDoc({ num: 'not-a-number' });

    expect(validateDynms(doc)).to.equal(false);
  });
});

function makeDoc(expr) {
  return {
    dynms: '0.3.0',
    models: [
      {
        id: 'model',
        timeVariable: { id: 't' },
        constants: [],
        dynamic: [
          {
            id: 'x',
            initial: 0,
            derivative: 0
          }
        ],
        static: [],
        assignments: [
          {
            id: 'y',
            rhs: expr
          }
        ],
        timeEvents: [],
        events: [],
        observables: []
      }
    ]
  };
}
