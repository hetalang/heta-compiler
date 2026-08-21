/* global describe, it */
const { expect } = require('chai');
const { SBMLParse } = require('../../src/module-system/sbml-parse');
const { _toMathExpr } = require('../../src/module-system/to-math-expr');
const fs = require('fs');
const path = require('path');

const sbml0Text = fs.readFileSync(path.join(__dirname, 'sbml0.xml'), 'utf8');
const master = [
  // PART 1
  { expectation: '1 + 2 + 3' },
  { expectation: 'a + b + c' },
  { expectation: '1 - 2' },
  { expectation: 'a - b' },
  { expectation: '1 * 2 * 3' },
  { expectation: '1 / 2' },
  { expectation: '(-1)' },
  { expectation: '(-x)' },
  // PART 2
  { expectation: '1 + 2 + 3 + 4' }, // <= 1 + (2 + 3) + 4
  { expectation: '1 - (2 + 3)' },
  { expectation: '1 * (2 + 3)' },
  { expectation: '1 / (2 + 3)' },
  { expectation: '(-(2 + 3))' },
  { expectation: '1 + 2 + 3' }, // <= (1 + 2) + 3
  { expectation: '2 + 3 - 1' }, // <=  (2 + 3) - 1
  { expectation: '(2 + 3) * 1' },
  { expectation: '(2 + 3) / 1' },
  // PART 3
  { expectation: '1 + (-2) + (-3) + 4' }, // => 1 -2 -3 + 4 
  { expectation: '1 - (-2)' },
  { expectation: '(-2) - 1' }, // => -2 - 1
  { expectation: '(-(-2))' },
  { expectation: '1 * (-2)' },
  { expectation: '(-2) * 1' },
  { expectation: '1 / (-2)' },
  { expectation: '(-2) / 1' },
  // PART 4
  { expectation: '1 + 2 * 3 + 4' },
  { expectation: '2 * 3 + 4' },
  { expectation: '1 + 2 / 3' },
  { expectation: '2 / 3 + 1' },
  // PART 5
  { expectation: 'sin(a + 2 + 3)' },
  { expectation: 'pow(a + 2 + 3, 1 - 2)' },
  // PART 6
  { expectation: 'x / (2 * 3)' },
  { expectation: '1 + (-2)' },
  { expectation: 'x + (-y)' },
  // PART 7
  { expectation: '(a > 10 ? 666 : 0)'},
  { expectation: 'piecewise(666, a > 10, 777, a > 11, 0)'},
  { expectation: 'piecewise(666, a > 10, 777, a > 11)'}
];

describe('test sbmlParse() operators', () => {
  let res = SBMLParse(sbml0Text);
  //console.log(res)

  res.forEach((x, i) => {
    it('Expect: ' + master[i].expectation, () => {
      expect(x).to.have.nested.property('assignments.ode_', master[i].expectation);
    });
  });
});

describe('zero- and unary-arity MathML operators', () => {
  [
    { operator: 'plus', operands: [], expectation: 'add()' },
    { operator: 'plus', operands: ['x'], expectation: 'add(x)' },
    { operator: 'times', operands: [], expectation: 'multiply()' },
    { operator: 'times', operands: ['x'], expectation: 'multiply(x)' }
  ].forEach(({ operator, operands, expectation }) => {
    it(`imports ${operator} with ${operands.length} operand(s)`, () => {
      let expression = _toMathExpr({
        name: 'apply',
        elements: [
          { name: operator },
          ...operands.map((text) => ({ name: 'ci', elements: [{ text }] }))
        ]
      });

      expect(expression).to.equal(expectation);
    });
  });
});

describe('zero- and unary-arity MathML boolean operators', () => {
  [
    { operator: 'and', operands: [], expectation: 'true' },
    { operator: 'and', operands: ['x'], expectation: 'x' },
    { operator: 'and', operands: ['x', 'y'], expectation: 'x and y' },
    { operator: 'or', operands: [], expectation: 'false' },
    { operator: 'or', operands: ['x'], expectation: 'x' },
    { operator: 'or', operands: ['x', 'y'], expectation: 'x or y' },
    { operator: 'xor', operands: [], expectation: 'false' },
    { operator: 'xor', operands: ['x'], expectation: 'x' },
    { operator: 'xor', operands: ['x', 'y'], expectation: 'x xor y' }
  ].forEach(({ operator, operands, expectation }) => {
    it(`imports ${operator} with ${operands.length} operand(s)`, () => {
      let expression = _toMathExpr({
        name: 'apply',
        elements: [
          { name: operator },
          ...operands.map((text) => ({ name: 'ci', elements: [{ text }] }))
        ]
      });

      expect(expression).to.equal(expectation);
    });
  });
});

describe('inverse hyperbolic MathML functions', () => {
  const functionNames = ['asinh', 'acosh', 'atanh', 'acoth', 'asech', 'acsch'];

  functionNames.forEach((functionName) => {
    it(`imports arc${functionName.slice(1)}() as ${functionName}()`, () => {
      const mathMLName = `arc${functionName.slice(1)}`;
      const expression = _toMathExpr({
        name: 'apply',
        elements: [
          { name: mathMLName },
          { name: 'ci', elements: [{ text: 'x' }] }
        ]
      });

      expect(expression).to.equal(`${functionName}(x)`);
    });
  });
});

const sbml1Text = fs.readFileSync(path.join(__dirname, 'sbml1.xml'), 'utf8');
describe('parse speciesType', () => {
  let res = SBMLParse(sbml1Text);
  // console.log(res);
  it('Should be of class "Component"', () => {
    expect(res[0]).to.have.property('class', 'Component');
  });
});

const sbml2Text = fs.readFileSync(path.join(__dirname, 'sbml2.xml'), 'utf8');
describe('parse units', () => {
  let res = SBMLParse(sbml2Text);

  it('Use units from UnitDef', () => {
    expect(res[6])
      .to.have.property('units').and
      .to.be.deep.equal([{ kind: 'second', exponent: 1, multiplier: 1 }]);
  });

  it('Use base units', () => {
    expect(res[7])
      .to.have.property('units').and
      .to.be.deep.equal([{ kind: 'second', exponent: 1, multiplier: 1 }]);
  });

  it('Use units that can be simplified', () => {
    expect(res[8])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'item', exponent: 1, multiplier: 1 },
        { kind: 'item', exponent: -1, multiplier: 1000 }
      ]);
  });

  it('Check different units for Species', () => {
    expect(res[2])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1 },
        { kind: 'litre', exponent: -1, multiplier: 1 }
      ]);
    expect(res[3])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1 },
        { kind: 'litre', exponent: -1, multiplier: 1e-3 }
      ]);
    expect(res[4])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1e-6 },
        { kind: 'litre', exponent: -1, multiplier: 1 }
      ]);
    expect(res[5])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'mole', exponent: 1, multiplier: 1e-6 },
        { kind: 'litre', exponent: -1, multiplier: 1e-3 }
      ]);

    expect(res[9])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'dimensionless', exponent: 1, multiplier: 1 }
      ]);
    expect(res[10])
      .to.have.property('units').and
      .to.be.deep.equal([
        { kind: 'dimensionless', exponent: 1, multiplier: 1 }
      ]);
  });
});

describe('parse parameter constant defaults', () => {
  function parseParameter(level) {
    let xml = `<sbml level="${level}" version="1"><model><listOfParameters><parameter id="p" value="1"/></listOfParameters></model></sbml>`;
    return SBMLParse(xml).find((q) => q.id === 'p');
  }

  it('uses the Level 2 default constant=true', () => {
    let parameter = parseParameter(2);

    expect(parameter).to.include({ id: 'p', class: 'Const', num: 1 });
  });

  it('keeps an omitted Level 3 constant attribute as a Record', () => {
    let parameter = parseParameter(3);

    expect(parameter).to.include({ id: 'p', class: 'Record' });
    expect(parameter).to.have.nested.property('assignments.start_', 1);
  });
});

describe('parse reaction reversible defaults', () => {
  function parseReaction(level, reversible) {
    let attribute = reversible === undefined ? '' : ` reversible="${reversible}"`;
    let xml = `<sbml level="${level}" version="${level === 2 ? 5 : 1}"><model><listOfReactions><reaction id="r"${attribute}/></listOfReactions></model></sbml>`;
    return SBMLParse(xml).find((q) => q.id === 'r');
  }

  it('uses the Level 2 default reversible=true', () => {
    expect(parseReaction(2)).to.include({ id: 'r', class: 'Reaction', reversible: true });
  });

  it('keeps an omitted Level 3 reversible attribute absent', () => {
    expect(parseReaction(3)).not.to.have.property('reversible');
  });

  it('keeps an explicit reversible attribute at every level', () => {
    expect(parseReaction(2, 'false')).to.include({ reversible: false });
    expect(parseReaction(3, 'true')).to.include({ reversible: true });
  });
});

describe('parse SBML special numbers', () => {
  it('keeps special values of local kinetic-law parameters', () => {
    let xml = `<sbml level="3" version="1"><model><listOfReactions><reaction id="r"><kineticLaw><listOfLocalParameters><localParameter id="positive" value="INF"/><localParameter id="negative" value="-INF"/><localParameter id="invalid" value="NaN"/></listOfLocalParameters></kineticLaw></reaction></listOfReactions></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr.find((q) => q.id === 'local_r_positive').num).to.equal(Infinity);
    expect(qArr.find((q) => q.id === 'local_r_negative').num).to.equal(-Infinity);
    expect(qArr.find((q) => q.id === 'local_r_invalid').num).to.be.NaN;
  });
});

describe('SBML-import generated identifiers', () => {
  it('uses a prefixed ID for rate-rule processes', () => {
    let xml = `<sbml level="3" version="1"><model><listOfParameters><parameter id="r1" value="1"/></listOfParameters><listOfRules><rateRule variable="r1"><math><cn>1</cn></math></rateRule></listOfRules></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr.find((q) => q.class === 'Process')).to.include({ id: 'rate_r1' });
  });

  it('numbers anonymous events from one', () => {
    let xml = `<sbml level="3" version="1"><model><listOfEvents><event><trigger><math><true/></math></trigger></event></listOfEvents></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr.find((q) => q.class === 'DSwitcher')).to.include({ id: 'event_1' });
  });
});
