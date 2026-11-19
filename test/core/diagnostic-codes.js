/* global describe, it */
const { expect } = require('chai');
const { Top } = require('../../src/core/top');
const HetaLevelError = require('../../src/heta-level-error');
const { Record } = require('../../src/core/record');
const { Const } = require('../../src/core/const');
const { CSwitcher } = require('../../src/core/c-switcher');
const { DSwitcher } = require('../../src/core/d-switcher');
const { StopSwitcher } = require('../../src/core/stop-switcher');
const { FunctionDef } = require('../../src/core/function-def');
const { UnitDef } = require('../../src/core/unit-def');
const { Scenario } = require('../../src/core/scenario');
const { Process } = require('../../src/core/process');
const { Species } = require('../../src/core/species');
const { Reaction } = require('../../src/core/reaction');
const { ajv } = require('../../src/ajv');
const { _Size } = require('../../src/core/_size');
const { Expression } = require('../../src/core/expression');
const { Unit } = require('../../src/core/unit');
const { rct2actors } = require('../../src/core/process');

function setup(Class) {
  const calls = [];
  const logger = Object.fromEntries(['error', 'warn'].map(level => [level, (message, opt) => calls.push({level, message, opt})]));
  const container = {logger, functionDefStorage: new Map(), unitDefStorage: new Map()};
  const namespace = {spaceName: 'model', container, get: () => undefined};
  const item = new Class();
  item._container = container;
  item.namespace = namespace;
  return {item, calls, container, namespace};
}

describe('core diagnostic codes', () => {
  it('reports schema failures while retaining metadata', () => {
    const {item, calls} = setup(Record);
    item.merge({id: '1bad', space: 'model'});
    expect(calls[0].level).to.equal('error');
    expect(calls[0].message).to.include('Some of properties do not satisfy requirements for class "Top"');
    expect(calls[0].opt).to.include({space: 'model', id: '1bad', className: 'Top', diagnosticCode: 'INVALID_PROPERTY'});
    expect(calls[0].opt.errors).to.be.an('array').that.is.not.empty;
    calls.length = 0;
    Top.isValid({id: 'ok', xmlAnnotation: 123}, item._container.logger);
    expect(calls[0].opt.diagnosticCode).to.equal('INVALID_PROPERTY');
    calls.length = 0;
    item.merge({id: 'ok', assignments: {start_: '1'}});
    expect(calls).to.be.empty;
  });

  it('uses one code for schema validation failures', () => {
    const cases = [
      [Scenario, {id: 's'}],
      [Scenario, {tspan: [0, 1]}],
      [Scenario, {}, 'INVALID_PROPERTY', ['MISSING_IDENTIFIER']],
      [Scenario, {id: 's', tspan: [0]}],
      [Scenario, {id: 's', tspan: [0, 1], parameters: {'123': 1}}],
      [Record, {assignments: {'123': 1}}],
      [Record, {assignments: {start_: {}}}],
      [Record, {assignments: {start_: ''}}],
      [Const, {num: 'invalid'}],
      [Const, {scale: 'invalid'}],
      [Reaction, {modifiers: [{}]}],
      [_Size, {units: '@@'}],
      [UnitDef, {id: 'u', units: [{kind: 'm', multiplier: -1}]}]
    ];
    for (const [Class, input] of cases) {
      const calls = [];
      expect(Class.isValid(input, {error: (message, opt) => calls.push({message, opt})})).to.equal(false);
      expect(calls, JSON.stringify(input)).to.have.length(1);
      expect(calls[0].opt, JSON.stringify(input)).to.include({space: input.space, id: input.id, className: Class.name, diagnosticCode: 'INVALID_PROPERTY'});
      expect(calls[0].opt.errors).to.be.an('array').that.is.not.empty;
    }
  });

  it('reports one code for an aggregate validation event', () => {
    const input = {id: 's', space: 'model', tspan: [0], parameters: {'1bad': 1}};
    const validate = Scenario.validate;
    validate(input);
    const expectedMessage = `s Some of properties do not satisfy requirements for class "Scenario"\n`
      + validate.errors.map((error, i) => `    ${i + 1}. ${error.instancePath} ${error.message}`).join('\n');
    const calls = [];
    expect(Scenario.isValid(input, {error: (message, opt) => calls.push({level: 'error', message, opt})})).to.equal(false);
    expect(calls).to.deep.equal([{
      level: 'error', message: expectedMessage,
      opt: {space: 'model', id: 's', className: 'Scenario', errors: validate.errors, diagnosticCode: 'INVALID_PROPERTY'}
    }]);
  });

  it('uses one code when multiple violations share one classification', () => {
    const validate = ajv.compile({type: 'object', properties: {a: {type: 'string'}, b: {type: 'string'}}});
    class SameType extends Top { static get validate() { return validate; } }
    const calls = [];
    SameType.isValid({a: 1, b: 2}, {error: (message, opt) => calls.push({message, opt})});
    expect(calls[0].opt).to.deep.equal({space: undefined, id: undefined, className: 'SameType', errors: validate.errors, diagnosticCode: 'INVALID_PROPERTY'});
  });

  it('preserves custom Ajv messages with one code', () => {
    const validate = ajv.compile({
      type: 'object', required: ['value'], additionalProperties: false,
      properties: {value: {type: 'number'}},
      errorMessage: {required: {value: 'custom'}, additionalProperties: 'custom', properties: {value: 'custom'}}
    });
    class Custom extends Top { static get validate() { return validate; } }
    for (const input of [
      {},
      {value: 'bad'},
      {value: 1, extra: 2},
      {extra: 2}
    ]) {
      const calls = [];
      Custom.isValid(input, {error: (message, opt) => calls.push({message, opt})});
      expect(calls[0].message).to.include('custom');
      expect(calls[0].opt).to.deep.equal({space: undefined, id: undefined, className: 'Custom', errors: validate.errors, diagnosticCode: 'INVALID_PROPERTY'});
    }
  });

  it('uses one code for allOf failures', () => {
    const validate = ajv.compile({allOf: [{type: 'string'}, {type: 'object', required: ['x']}]});
    class Combined extends Top { static get validate() { return validate; } }
    const calls = [];
    Combined.isValid({}, {error: (message, opt) => calls.push({message, opt})});
    expect(calls[0].opt).to.deep.equal({space: undefined, id: undefined, className: 'Combined', errors: validate.errors, diagnosticCode: 'INVALID_PROPERTY'});
  });

  it('propagates expression parse codes without changing messages or levels', () => {
    for (const Class of [Record, CSwitcher, DSwitcher, StopSwitcher, FunctionDef]) {
      const {item, calls} = setup(Class);
      item.merge(Class === Record ? {id: 'x', assignments: {start_: '1 +'}} : Class === FunctionDef ? {id: 'x', arguments: ['a'], math: '1 +'} : {id: 'x', trigger: '1 +'});
      expect(calls).to.have.length(1);
      expect(calls[0].level).to.equal('error');
      expect(calls[0].message).to.include('Cannot parse MathExpr properly.');
      expect(calls[0].opt).to.deep.equal({diagnosticCode: 'INVALID_EXPRESSION', expression: '1 +', id: 'x', ...(Class === FunctionDef ? {} : {space: 'model'}), path: Class === Record ? 'assignments.start_' : Class === FunctionDef ? 'math' : 'trigger'});
    }
    expect(() => Expression.fromString('[')).to.throw(HetaLevelError).with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_EXPRESSION', expression: '['});
    const {item, calls} = setup(FunctionDef);
    item.merge({id: 'my_piecewise', arguments: ['x', 'y', 'z'], math: '1 ? x : z'});
    expect(calls[0].message).to.equal('Function "my_piecewise": Condition "1" must be a boolean expression. Expression: "1 ? x : z".');
    expect(calls[0].opt).to.include({id: 'my_piecewise', path: 'math', condition: '1'});
    const valid = setup(FunctionDef);
    valid.item.merge({id: 'my_piecewise', arguments: ['x', 'y', 'z'], math: '(y) ? x : z'});
    expect(valid.calls).to.be.empty;
    expect(valid.item.math).to.exist;
  });

  it('distinguishes numeric and boolean expression requirements', () => {
    for (const Class of [Record, CSwitcher, FunctionDef]) {
      const {item, calls} = setup(Class);
      const input = Class === Record ? {id: 'x', assignments: {start_: '1 > 0'}} : Class === CSwitcher ? {id: 'x', trigger: '1 > 0'} : {id: 'x', arguments: [], math: '1 > 0'};
      item.merge(input);
      expect(calls.some(c => c.opt.diagnosticCode === 'EXPECTED_NUMERIC_EXPRESSION')).to.equal(true);
    }
    for (const Class of [DSwitcher, StopSwitcher]) {
      const {item, calls} = setup(Class);
      item.merge({id: 'x', trigger: '1'});
      expect(calls[0].opt.diagnosticCode).to.equal('EXPECTED_BOOLEAN_EXPRESSION');
    }
  });

  it('uses consistent reference and function codes across expression classes', () => {
    for (const Class of [Record, CSwitcher, DSwitcher, StopSwitcher]) {
      const {item, calls, container, namespace} = setup(Class);
      const expr = Class === DSwitcher || Class === StopSwitcher ? 'f(missing) > 0' : 'f(missing)';
      item.merge(Class === Record ? {id: 'x', assignments: {start_: expr}} : {id: 'x', trigger: expr});
      item.bind(namespace);
      expect(calls.map(c => c.opt.diagnosticCode)).to.include.members(['MISSING_REFERENCE', 'UNKNOWN_FUNCTION']);
      const missing = calls.find(c => c.opt.diagnosticCode === 'MISSING_REFERENCE');
      expect(missing.opt).to.deep.equal({space: 'model', diagnosticCode: 'MISSING_REFERENCE', id: 'x',
        path: Class === Record ? 'assignments.start_' : 'trigger', reference: 'missing', expression: expr});
      const unknownFunction = calls.find(c => c.opt.diagnosticCode === 'UNKNOWN_FUNCTION');
      expect(unknownFunction.opt).to.deep.equal({diagnosticCode: 'UNKNOWN_FUNCTION', space: 'model', id: 'x',
        path: Class === Record ? 'assignments.start_' : 'trigger', functionId: 'f', expression: expr});
      if (Class === Record) expect(unknownFunction.message).to.include('f(missing)').and.not.include('undefined');
      calls.length = 0;
      namespace.get = () => ({instanceOf: () => false});
      container.functionDefStorage.set('f', {arguments: ['a', 'b']});
      item.bind(namespace);
      expect(calls.map(c => c.opt.diagnosticCode)).to.include.members(['WRONG_REFERENCE_TYPE', 'FUNCTION_ARGUMENT_COUNT']);
      const countError = calls.find(c => c.opt.diagnosticCode === 'FUNCTION_ARGUMENT_COUNT');
      expect(countError.opt).to.deep.equal({diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: 'f', requiredArguments: 2,
        providedArguments: 1, id: 'x', space: 'model', path: Class === Record ? 'assignments.start_' : 'trigger'});
      if (Class === CSwitcher) expect(countError.message).to.include('CSwitcher "x"');
      const repeated = Class === DSwitcher || Class === StopSwitcher ? 'f(1, 2) + f(1) > 0' : 'f(1, 2) + f(1)';
      item.merge(Class === Record ? {id: 'x', assignments: {start_: repeated}} : {id: 'x', trigger: repeated});
      calls.length = 0;
      item.bind(namespace);
      expect(calls.filter(c => c.opt.diagnosticCode === 'FUNCTION_ARGUMENT_COUNT')).to.have.lengthOf(1);
      const expression = Class === Record ? item.assignments.start_ : item.trigger;
      expect(expression.functionList(false)).to.have.lengthOf(2);
      expect(expression.functionList(false).every(node => node.fnObj === container.functionDefStorage.get('f'))).to.equal(true);
    }
    const record = setup(Record);
    record.item.merge({id: 'x', assignments: {start_: '1', event1: '2'}});
    record.item.bind(record.namespace);
    expect(record.calls.find(c => c.opt.diagnosticCode === 'MISSING_ASSIGNMENT_SWITCHER')).to.deep.include({level: 'warn'});
    expect(record.calls.find(c => c.opt.diagnosticCode === 'MISSING_ASSIGNMENT_SWITCHER').opt).to.deep.equal({
      diagnosticCode: 'MISSING_ASSIGNMENT_SWITCHER', space: 'model', id: 'x', path: 'assignments.event1', switcher: 'event1'
    });
    const {item, calls, container} = setup(FunctionDef);
    item.merge({id: 'x', arguments: ['a'], math: 'f(a)'});
    container.functionDefStorage.set('f', {arguments: ['a', 'b']});
    item.bind();
    expect(calls.find(c => c.opt.diagnosticCode === 'FUNCTION_ARGUMENT_COUNT').opt).to.deep.equal({
      diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: 'f', requiredArguments: 2, providedArguments: 1, id: 'x', space: undefined, path: 'math'
    });
    item.merge({id: 'x', arguments: ['a'], math: 'f(a, a) + f(a)'});
    calls.length = 0;
    item.bind();
    expect(calls.filter(c => c.opt.diagnosticCode === 'FUNCTION_ARGUMENT_COUNT')).to.have.lengthOf(1);
  });

  it('distinguishes bound and scale violations with unchanged messages', () => {
    const {item, calls, namespace} = setup(Const);
    item.merge({id: 'k', num: -1, lower: 0, scale: 'log'});
    item.bind(namespace);
    expect(calls).to.deep.equal([
      {level: 'error', message: 'Constant "model::k" value -1 is below its lower bound 0.', opt: {space: 'model', diagnosticCode: 'VALUE_OUT_OF_BOUNDS', id: 'k', path: 'num', value: -1, bound: 'lower', limit: 0}},
      {level: 'error', message: 'Constant "model::k" must have a positive value for the "log" scale; got -1.', opt: {space: 'model', diagnosticCode: 'SCALE_VALUE_OUT_OF_RANGE', id: 'k', path: 'num', value: -1, scale: 'log'}}
    ]);
  });

  it('propagates unit parse errors in both components and unit definitions', () => {
    for (const Class of [Const, UnitDef]) {
      const {item, calls} = setup(Class);
      item.merge({id: 'x', units: 'a^^b'});
      expect(calls).to.have.length(1);
      expect(calls[0].message).to.include('Invalid unit expression item');
      expect(calls[0].opt).to.deep.equal({diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: 'a^^b', unitItem: 'a^^b', itemIndex: 0, reason: 'invalid_syntax',
        space: Class === Const ? 'model' : undefined, id: 'x', path: 'units'});
      expect(calls[0].level).to.equal('error');
      if (Class === UnitDef) expect(item.errored).to.equal(true);
    }
    expect(() => Unit.parse('a^^b')).to.throw(HetaLevelError).with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: 'a^^b', unitItem: 'a^^b', itemIndex: 0, reason: 'invalid_syntax'});
    expect(() => Unit.parse('')).to.throw(HetaLevelError).with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: '', reason: 'empty'});
    const longUnit = 'a'.repeat(101);
    expect(() => Unit.parse(longUnit)).to.throw(HetaLevelError).with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: longUnit, unitItem: longUnit, itemIndex: 0, reason: 'item_too_long', maxLength: 100});
    expect(() => rct2actors('a => !')).to.throw(HetaLevelError).with.property('opt').that.deep.equals({diagnosticCode: 'INVALID_PROCESS_EXPRESSION', expression: 'a => !'});
    const {item, calls} = setup(Process);
    item.merge({id: 'x', actors: 'a => !'});
    expect(calls.find(c => c.opt?.diagnosticCode === 'INVALID_PROCESS_EXPRESSION').opt).to.deep.equal({
      diagnosticCode: 'INVALID_PROCESS_EXPRESSION', expression: 'a => !', space: 'model', id: 'x', path: 'actors'
    });
    const originalFromQ = Unit.fromQ;
    try {
      Unit.fromQ = () => { throw new HetaLevelError('invalid unit', {diagnosticCode: 'INVALID_UNIT_DEFINITION', unitItem: {kind: 1}, itemIndex: 0}); };
      for (const Class of [Const, UnitDef]) {
        const result = setup(Class);
        result.item.merge({id: 'x', units: [{kind: 'm'}]});
        if (Class === UnitDef) expect(result.item.errored).to.equal(true);
        expect(result.calls[0].opt).to.deep.equal({diagnosticCode: 'INVALID_UNIT_DEFINITION', unitItem: {kind: 1}, itemIndex: 0,
          space: Class === Const ? 'model' : undefined, id: 'x', path: 'units'});
      }
    } finally {
      Unit.fromQ = originalFromQ;
    }
    const termResult = setup(UnitDef);
    UnitDef.isValid = () => true;
    try {
      termResult.item.merge({id: 'x', terms: [{kind: 'bad'}]});
    } finally {
      delete UnitDef.isValid;
    }
    expect(termResult.calls[0].opt).to.deep.equal({diagnosticCode: 'INVALID_UNIT_TERM', termItem: {kind: 'bad'},
      itemIndex: 0, allowedKinds: ['amount', 'length', 'time', 'mass', 'current', 'temperature'], space: undefined, id: 'x', path: 'terms'});
    expect(termResult.item.errored).to.equal(true);
  });

  it('preserves expected unit error context and propagates unexpected errors', () => {
    const original = Unit.parse;
    try {
      for (const Class of [Const, UnitDef]) {
        for (const expected of [true, false]) {
          const {item, calls} = setup(Class);
          const failure = expected ? new HetaLevelError('failure', {diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: 'm'}) : new Error('failure');
          Unit.parse = () => { throw failure; };
          if (!expected) {
            expect(() => item.merge({id: 'x', units: 'm'})).to.throw(failure);
            expect(calls).to.be.empty;
            continue;
          }
          item.merge({id: 'x', units: 'm'});
          expect(calls).to.have.length(1);
          expect(calls[0].message).to.equal(Class === Const ? 'model::x: failure' : 'x: failure');
          expect(calls[0].level).to.equal('error');
          expect(calls[0].opt).to.deep.equal({space: Class === Const ? 'model' : undefined, id: 'x', path: 'units', diagnosticCode: 'INVALID_UNIT_EXPRESSION', unitExpression: 'm'});
        }
      }
    } finally {
      Unit.parse = original;
    }
  });

  it('groups equivalent unit operation warnings and distinguishes missing units', () => {
    const {item, calls} = setup(Record);
    item.merge({id: 'x'});
    const unit = Unit.parse('m');
    unit[0].kindObj = {};
    for (const source of ['a + b', 'add(a, b)', 'a > b', 'true ? a : b']) {
      const expr = Expression.fromString(source);
      expr.dependOnNodes().forEach(node => { node.nameObj = {unitsParsed: node.name === 'a' ? unit : new Unit()}; });
      expr.calcUnit(item);
      expect(calls.pop().opt.diagnosticCode).to.equal('UNIT_MISMATCH');
    }
    Expression.fromString('missing').calcUnit(item);
    expect(calls.pop()).to.deep.equal({level: 'warn', message: 'Cannot calculate units for "model::x" because reference "missing" is not bound.', opt: {diagnosticCode: 'UNIT_CALCULATION_FAILED', space: 'model', id: 'x', reference: 'missing'}});
    const noUnits = Expression.fromString('missing');
    noUnits.dependOnNodes()[0].nameObj = {};
    expect(noUnits.calcUnit(item)).to.equal(undefined);
    expect(calls).to.be.empty;
  });

  it('distinguishes unit exponent and dimensionless requirements', () => {
    const {item, calls} = setup(Record);
    item.merge({id: 'x'});
    const unit = Unit.parse('m');
    unit[0].kindObj = {};
    for (const [source, code] of [['a ^ b', 'UNIT_EXPONENT_MISMATCH'], ['pow(a, b)', 'UNIT_EXPONENT_MISMATCH'], ['nthRoot(a, b)', 'UNIT_EXPONENT_MISMATCH'], ['sin(a)', 'UNIT_DIMENSIONLESS_REQUIRED'], ['a and b', 'UNIT_DIMENSIONLESS_REQUIRED']]) {
      const expr = Expression.fromString(source);
      expr.dependOnNodes().forEach(node => { node.nameObj = {unitsParsed: unit}; });
      expr.calcUnit(item);
      expect(calls.pop().opt.diagnosticCode).to.equal(code);
    }
    Expression.fromString('1 + 2').calcUnit(item);
    expect(calls).to.be.empty;
  });

  it('uses the namespace diagnostic when a scenario model is missing', () => {
    const {item, calls, container} = setup(Scenario);
    item.merge({id: 's', model: 'absent', tspan: [0, 1]});
    container.namespaceStorage = new Map();
    item.bind();
    expect(calls[0].opt.diagnosticCode).to.equal('MISSING_NAMESPACE');
  });

  it('classifies missing scenario references separately from wrong types', () => {
    const {item, calls, container} = setup(Scenario);
    item.merge({id: 's', model: 'model', tspan: [0, 1], parameters: {x: 1}});
    container.namespaceStorage = new Map([['model', {get: () => undefined}]]);
    item.bind();
    expect(calls[0].opt.diagnosticCode).to.equal('MISSING_REFERENCE');
    calls.length = 0;
    container.namespaceStorage.set('model', {get: () => ({instanceOf: () => false})});
    item.bind();
    expect(calls[0].opt.diagnosticCode).to.equal('WRONG_REFERENCE_TYPE');
  });

  it('classifies scenario time ordering and ODE unit mismatches', () => {
    const scenario = setup(Scenario);
    scenario.item.merge({id: 's', tspan: [1, 0]});
    expect(scenario.calls[0]).to.deep.equal({level: 'error', message: 'Scenario "s" has an invalid time span: the start time must be less than the end time.', opt: {diagnosticCode: 'INVALID_TIME_SPAN', id: 's', path: 'tspan', tspan: [1, 0]}});
    scenario.calls.length = 0;
    scenario.item.merge({id: 's', tspan: [1, 1]});
    expect(scenario.calls[0].opt).to.deep.equal({diagnosticCode: 'INVALID_TIME_SPAN', id: 's', path: 'tspan', tspan: [1, 1]});

    const {item, calls, namespace} = setup(Species);
    item.merge({id: 'x', isAmount: true, units: 'm'});
    item.unitsParsed[0].kindObj = {};
    namespace.get = () => ({unitsParsed: new Unit()});
    item.backReferences = [{_process_: {id: 'p', unitsParsed: new Unit()}}];
    item.checkUnits();
    expect(calls).to.have.length(1);
    expect(calls[0].level).to.equal('warn');
    expect(calls[0].opt.diagnosticCode).to.equal('ODE_UNIT_MISMATCH');
  });

  it('distinguishes missing actors from missing record initialization', () => {
    const {item, calls, namespace} = setup(Process);
    item.merge({id: 'p'});
    item.bind(namespace);
    expect(calls.map(c => [c.level, c.opt.diagnosticCode])).to.deep.equal([
      ['error', 'MISSING_INITIAL_VALUE'], ['warn', 'EMPTY_PROCESS_ACTORS']
    ]);
  });

  it('propagates rebase and substitution exceptions without using Node error code', () => {
    const {item, calls} = setup(Const);
    item.merge({id: 'x', units: 'm'});
    expect(() => item.unitsRebased()).to.throw(TypeError);
    expect(calls).to.be.empty;
    item.unitsParsed[0].kindObj = {};
    expect(item.unitsRebased()).to.equal(undefined);
    expect(calls[0].opt).to.deep.equal({diagnosticCode: 'UNIT_CONVERSION_UNAVAILABLE', unit: 'm', legalUnits: [], component: 'model::x', space: 'model'});
    calls.length = 0;
    item.unitsParsed[0].multiplier = 0.3;
    expect(item.unitsRebased(['m'], true)).to.equal(undefined);
    expect(calls[0].opt).to.deep.equal({diagnosticCode: 'UNIT_PREFIX_UNAVAILABLE', unit: 'm', multiplier: 0.3, component: 'model::x', space: 'model'});
    for (const convert of [unit => unit.rebase(), unit => unit.rebaseToPrimitive()]) {
      expect(() => convert(Unit.fromQ([{kind: 'm'}]))).to.throw(TypeError).and.not.have.property('diagnosticCode');
    }
    const expr = Expression.fromString('f(1)');
    expr.functionList()[0].fnObj = {id: 'f', arguments: ['a', 'b'], math: Expression.fromString('a + b')};
    try {
      expr.substituteByDefinitions();
      throw new Error('expected substitution failure');
    } catch (error) {
      expect(error).to.be.instanceOf(HetaLevelError);
      expect(error.opt).to.deep.equal({diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: 'f', requiredArguments: 2, providedArguments: 1});
      expect(error).not.to.have.property('code');
    }
  });

  it('propagates unexpected expression errors', () => {
    const {item, calls} = setup(Record);
    const original = Expression.fromString;
    try {
      Expression.fromString = () => { throw new Error('internal failure'); };
      expect(() => item.merge({id: 'x', assignments: {start_: '1'}})).to.throw('internal failure');
    } finally {
      Expression.fromString = original;
    }
    expect(calls).to.be.empty;
  });
});
