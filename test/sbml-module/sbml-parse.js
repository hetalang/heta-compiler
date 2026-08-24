/* global describe, it */
const { expect } = require('chai');
const { SBMLParse, SBMLParseDetailed } = require('../../src/module-system/sbml-parse');
const { _toMathExpr } = require('../../src/module-system/to-math-expr');
const HetaLevelError = require('../../src/heta-level-error');
const { Builder } = require('../../src/builder');
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

  it('keeps assignments but does not create a switcher for an event without a trigger', () => {
    let xml = `<sbml level="3" version="2"><model><listOfParameters><parameter id="p" value="3"/></listOfParameters><listOfEvents><event id="E0"><listOfEventAssignments><eventAssignment variable="p"><math><cn>2</cn></math></eventAssignment></listOfEventAssignments></event></listOfEvents></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr.find((q) => q.id === 'E0')).to.be.undefined;
    expect(qArr.find((q) => q.id === 'p' && q.assignments?.E0)).to.deep.include({ assignments: { E0: '2' } });
  });
});

describe('unsupported SBML event features', () => {
  it('rejects delayed events with an informative message', () => {
    let xml = `<sbml level="3" version="1"><model><listOfEvents><event id="delayed_event"><trigger><math><true/></math></trigger><delay><math><cn>2</cn></math></delay></event></listOfEvents></model></sbml>`;

    expect(() => SBMLParse(xml)).to.throw(
      HetaLevelError,
      'SBML event delay is not supported on import for event "delayed_event". Heta Compiler cannot preserve delayed event execution.'
    );
  });

  it('rejects event priorities with an informative message', () => {
    let xml = `<sbml level="3" version="1"><model><listOfEvents><event id="prioritized_event"><trigger><math><true/></math></trigger><priority><math><cn>-2</cn></math></priority></event></listOfEvents></model></sbml>`;

    expect(() => SBMLParse(xml)).to.throw(
      HetaLevelError,
      'SBML event priority is not supported on import for event "prioritized_event". Heta Compiler cannot preserve event execution order.'
    );
  });
});

describe('SBML Level 3 packages', () => {
  it('rejects a required package regardless of its XML prefix', () => {
    let xml = `<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core" xmlns:extension="http://www.sbml.org/sbml/level3/version1/comp/version1" level="3" version="1" extension:required="true"><model/></sbml>`;

    expect(() => SBMLParse(xml)).to.throw(
      HetaLevelError,
      'SBML Level 3 package with required="true" is not supported: "comp" (http://www.sbml.org/sbml/level3/version1/comp/version1).'
    );
  });

  it('allows an optional package declaration', () => {
    let xml = `<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core" xmlns:extension="http://www.sbml.org/sbml/level3/version1/comp/version1" level="3" version="1" extension:required="false"><model><listOfParameters><parameter id="p" value="1"/></listOfParameters></model></sbml>`;

    expect(() => SBMLParse(xml)).not.to.throw();
  });

  it('reports a required package as a regular compilation error', () => {
    let xml = `<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core" xmlns:extension="http://www.sbml.org/sbml/level3/version1/comp/version1" level="3" version="1" extension:required="true"><model/></sbml>`;
    let logs = [];
    let builder = new Builder(
      { id: 'test', options: {}, importModule: { type: 'sbml', source: 'model.xml' }, export: [] },
      () => Buffer.from(xml),
      () => {},
      [(level, message, details) => logs.push({ level, message, details })]
    );

    expect(() => builder.run()).not.to.throw();
    expect(builder.logger.hasErrors).to.equal(true);
    expect(logs.find((log) => log.level === 'error')).to.nested.include({
      'details.type': 'ModuleError',
      'details.filename': 'model.xml'
    });
  });
});

describe('unsupported SBML Core MathML', () => {
  it('rejects delay csymbols even inside an ignored event priority', () => {
    let xml = `<sbml level="3" version="1"><model><listOfEvents><event id="event"><priority><math><apply><csymbol definitionURL="http://www.sbml.org/sbml/symbols/delay">delay</csymbol><cn>1</cn><cn>1</cn></apply></math></priority></event></listOfEvents></model></sbml>`;

    expect(() => SBMLParse(xml)).to.throw(HetaLevelError, 'SBML MathML CSymbolDelay is not supported.');
  });

  it('rejects references to SpeciesReference IDs even inside an ignored event priority', () => {
    let xml = `<sbml level="3" version="1"><model><listOfReactions><reaction id="reaction"><listOfReactants><speciesReference id="stoich" species="species"/></listOfReactants></reaction></listOfReactions><listOfEvents><event id="event"><priority><math><ci>stoich</ci></math></priority></event></listOfEvents></model></sbml>`;

    expect(() => SBMLParse(xml)).to.throw(HetaLevelError, 'SBML MathML SpeciesReferenceInMath is not supported: "stoich".');
  });

  it('allows a kinetic-law local parameter that shadows a SpeciesReference ID', () => {
    let xml = `<sbml level="3" version="1"><model><listOfReactions><reaction id="reaction"><listOfReactants><speciesReference id="stoich" species="species"/></listOfReactants><kineticLaw><listOfLocalParameters><localParameter id="stoich" value="1"/></listOfLocalParameters><math><ci>stoich</ci></math></kineticLaw></reaction></listOfReactions></model></sbml>`;

    expect(() => SBMLParse(xml)).not.to.throw();
  });
});

describe('SBML-import identifier renaming', () => {
  it('renames global IDs and rewrites their references', () => {
    let xml = `<sbml level="3" version="1"><model><listOfParameters><parameter id="_x" value="1"/><parameter id="begin" value="2"/><parameter id="sbml__x_1" value="3"/></listOfParameters><listOfRules><assignmentRule variable="_x"><math><apply><plus/><ci>_x</ci><ci>begin</ci></apply></math></assignmentRule></listOfRules><listOfReactions><reaction id="_r"><kineticLaw><listOfLocalParameters><localParameter id="_k" value="4"/></listOfLocalParameters><math><apply><plus/><ci>_k</ci><ci>_x</ci></apply></math></kineticLaw></reaction></listOfReactions></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr.find((q) => q.id === 'sbml__x_2' && q.assignments?.ode_)).to.have.nested.property('assignments.ode_', 'sbml__x_2 + sbml_begin_1');
    expect(qArr.find((q) => q.id === 'local_sbml__r_1__k')).to.include({ num: 4 });
    expect(qArr.find((q) => q.id === 'sbml__r_1')).to.have.nested.property('assignments.ode_', 'local_sbml__r_1__k + sbml__x_2');
  });

  it('renames function arguments in their local scope', () => {
    let xml = `<sbml level="3" version="1"><model><listOfFunctionDefinitions><functionDefinition id="f"><math><lambda><bvar><ci>_x</ci></bvar><apply><plus/><ci>_x</ci><cn>1</cn></apply></lambda></math></functionDefinition></listOfFunctionDefinitions></model></sbml>`;
    let qArr = SBMLParse(xml);

    expect(qArr[0]).to.include({ id: 'f', math: 'sbml__x_1 + 1' });
    expect(qArr[0].arguments).to.deep.equal(['sbml__x_1']);
  });

  it('collects renamed and created identifiers in a structured report', () => {
    let xml = `<sbml level="3" version="1"><model><listOfFunctionDefinitions><functionDefinition id="f"><math><lambda><bvar><ci>_arg</ci></bvar><apply><plus/><ci>_arg</ci><cn>1</cn></apply></lambda></math></functionDefinition></listOfFunctionDefinitions><listOfParameters><parameter id="_x" value="1"/></listOfParameters><listOfRules><rateRule variable="_x"><math><cn>1</cn></math></rateRule></listOfRules><listOfReactions><reaction id="r"><kineticLaw><listOfLocalParameters><localParameter id="k" value="2"/></listOfLocalParameters><math><ci>k</ci></math></kineticLaw></reaction></listOfReactions><listOfEvents><event><trigger><math><true/></math></trigger></event></listOfEvents></model></sbml>`;
    let { qArr, renamed, created } = SBMLParseDetailed(xml);

    expect(qArr).to.be.an('array').that.is.not.empty;
    expect(renamed).to.deep.equal({ _x: 'sbml__x_1' });
    expect(created).to.deep.equal([
      'local_r_k',
      'rate_sbml__x_1',
      'event_1'
    ]);
  });

  it('logs one identifier report for a successfully imported SBML file', () => {
    let xml = `<sbml level="3" version="1"><model><listOfParameters><parameter id="_x" value="1"/></listOfParameters></model></sbml>`;
    let logs = [];
    let builder = new Builder(
      { id: 'test', options: {}, importModule: { type: 'sbml', source: 'model.xml' }, export: [] },
      () => Buffer.from(xml),
      () => {},
      [(level, message, details) => logs.push({ level, message, details })]
    );

    builder.run();

    let report = logs.find((log) => log.details?.type === 'SBMLImportIdentifiers');
    expect(report).to.deep.include({
      level: 'info',
      message: 'SBML identifiers converted: 1 renamed, 0 created.'
    });
    expect(report.details).to.deep.equal({
      type: 'SBMLImportIdentifiers',
      renamed: { _x: 'sbml__x_1' },
      created: []
    });
  });
});
