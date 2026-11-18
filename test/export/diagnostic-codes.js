/* global describe, it */
const { expect } = require('chai');
const { Builder } = require('../../src');
const { Namespace } = require('../../src/namespace');
const { Expression, math } = require('../../src/core/expression');
const { Unit } = require('../../src/core/unit');
const { AbstractExport } = require('../../src/abstract-export');
const { ajv } = require('../../src/ajv');
require('../../src/dbsolve-export/namespace');
require('../../src/dbsolve-export/expression');
require('../../src/slv-export/namespace');
require('../../src/sbml-export/namespace');
require('../../src/simbio-export/namespace');
require('../../src/mrgsolve-export/namespace');
require('../../src/mrgsolve-export/expression');
require('../../src/dynms');

function capture() {
  const entries = [];
  const logger = {};
  for (const level of ['warn', 'error', 'info']) {
    logger[level] = (msg, opt) => entries.push({level, msg, opt});
  }
  return {logger, entries};
}

function codes(entries) {
  return entries.map(({opt}) => opt && opt.diagnosticCode);
}

describe('Export diagnostic codes', () => {
  it('reports invalid exporter configuration and empty namespace selections', () => {
    const builder = new Builder();
    const entries = [];
    builder.logger.addTransport((level, msg, opt) => entries.push({level, msg, opt}));
    const invalid = new builder.exportClasses.json({omit: 'invalid'});
    expect(invalid.errored).to.equal(true);
    expect(entries[0].level).to.equal('error');
    expect(entries[0].msg).to.match(/^Some of properties do not satisfy requirements/);
    expect(entries[0].opt.diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(entries[0].opt.errors).to.be.an('array').that.is.not.empty;
    entries.length = 0;
    const exporter = new builder.exportClasses.json({spaceFilter: '^not-a-namespace$'});
    expect(exporter.selectedNamespaces()).to.deep.equal([]);
    expect(entries[0]).to.deep.equal({level: 'warn', msg: 'Nothing was exported because there is no concrete namespaces matching spaceFilter in "json".', opt: {diagnosticCode: 'EXPORT_NO_MATCHING_NAMESPACES', format: 'json', filter: '^not-a-namespace$'}});
  });

  it('uses one code for export configuration validation', () => {
    const {logger, entries} = capture();
    function check(schema, value) {
      const validate = ajv.compile(schema);
      class TestExport extends AbstractExport {
        static get validate() { return validate; }
      }
      entries.length = 0;
      expect(TestExport.isValid(value, logger)).to.equal(false);
      expect(entries).to.have.length(1);
      expect(entries[0].level).to.equal('error');
      expect(entries[0].msg).to.equal('Some of properties do not satisfy requirements for "TestExport"\n'
        + validate.errors.map((x, i) => `    ${i+1}. ${x.instancePath} ${x.message}`).join('\n'));
      expect(entries[0].opt.errors).to.deep.equal(validate.errors);
      return entries[0].opt;
    }

    expect(check({type: 'object', required: ['a']}, {}).diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'object', properties: {a: {type: 'number'}}}, {a: 'bad'}).diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'object', additionalProperties: false}, {extra: 1}).diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'string', enum: ['valid']}, 'bad').diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'string', pattern: '^x$'}, 'bad').diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'number', minimum: 1}, 0).diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(check({type: 'number', multipleOf: 2}, 3).diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');

    entries.length = 0;
    const builder = new Builder();
    builder.logger.addTransport((level, msg, opt) => entries.push({level, msg, opt}));
    expect(new builder.exportClasses.slv({powTransform: 'invalid'}).errored).to.equal(true);
    expect(entries[0].opt.diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');

    const grouped = {type: 'object', properties: {a: {type: 'number'}}, required: ['a', 'b'], additionalProperties: false, errorMessage: 'custom validation message'};
    const mixed = check(grouped, {a: 'bad', extra: 1});
    expect(entries[0].msg).to.equal('Some of properties do not satisfy requirements for "TestExport"\n    1.  custom validation message');
    expect(mixed.diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    const same = check({type: 'object', required: ['a', 'b'], errorMessage: 'missing'}, {});
    expect(same.diagnosticCode).to.equal('INVALID_EXPORT_CONFIGURATION');
    expect(same.errors).to.be.an('array').that.is.not.empty;
  });

  it('preserves expression output and distinguishes unsupported features', () => {
    const {logger, entries} = capture();
    const piecewise = Expression.fromString('piecewise(x, x > 0, 0)');
    expect(piecewise.toSLVString(logger, 'keep', false)).to.equal('piecewise(x,x > 0,0)');
    expect(piecewise.toCString(logger, {}, false)).to.equal('piecewise(x,x > 0.0,0.0)');
    expect(Expression.fromString('(x > 0 and y > 0) ? 1 : 2').toSLVString(logger, 'keep', false)).to.equal('ifgt([error], [error], 1, 2)');
    expect(codes(entries)).to.deep.equal(['DBSOLVE_UNSUPPORTED_FUNCTION', 'MRGSOLVE_UNSUPPORTED_FUNCTION', 'DBSOLVE_UNSUPPORTED_CONDITION']);
    expect(entries.map(x => x.level)).to.deep.equal(['error', 'error', 'error']);
    expect(entries[0].msg).to.equal('DBS and SLV formats do not support "piecewise" function, got "piecewise(x, x > 0, 0)"');
    expect(entries[1].msg).to.equal('mrgsolve format does not support "piecewise" function, got "piecewise(x, x > 0, 0)"');
    expect(() => piecewise.toSLVString(logger, 'invalid', false)).to.throw(TypeError).and.not.have.property('diagnosticCode');
    expect(() => new Expression(math.parse('[1, 2]')).toMathJSON()).to.throw(TypeError, 'Unsupported MathExpr node for MathJSON export: ArrayNode').and.not.have.property('diagnosticCode');
  });

  it('reports SLV unsupported initial values, nonlinear assignments and ignored event types', () => {
    const {logger, entries} = capture();
    const expr = Expression.fromString('x * (y + z)');
    const record = {id: 'x', index: 'x', assignments: {start_: Expression.fromString('y'), dose: expr}};
    const switcher = {id: 'dose', getStart: () => 1, stopObj: undefined};
    const ns = {
      container: {logger}, toArray: () => [], sortExpressionsByContext: () => [],
      selectRecordsByContext: context => context === 'start_' || context === 'dose' ? [record] : [],
      selectByClassName: name => ({TimeSwitcher: [switcher], DSwitcher: [{id: 'd'}], CSwitcher: [{id: 'c'}], Const: []})[name] || []
    };
    const image = Namespace.prototype.getSLVImage.call(ns, 'tags[0]', 'keep', '26');
    expect(image.events).to.deep.equal([]);
    expect(codes(entries)).to.deep.equal(['SLV_UNSUPPORTED_INITIAL_EXPRESSION', 'SLV_EVENT_ASSIGNMENT_IGNORED', 'SLV_DISCRETE_EVENTS_IGNORED', 'SLV_CONTINUOUS_EVENTS_IGNORED']);
    expect(entries.every(x => x.level === 'error')).to.equal(true);
    expect(entries[1].msg).to.equal('SLV format cannot export expression "x [dose]= x * (y + z)". Use only expressions of type: \'a * x + b\'. This event will be ignored.');
  });

  it('reports DBSolve trigger limitations and continuous event conversion', () => {
    const {logger, entries} = capture();
    const d = {id: 'd', trigger: Expression.fromString('a and b')};
    const c = {id: 'c', space: 'model'};
    const ns = {
      spaceName: 'model', container: {logger}, selectByInstanceOf: () => [], sortExpressionsByContext: () => [],
      selectRecordsByContext: () => [], selectByClassName: name => ({DSwitcher: [d], CSwitcher: [c], Const: []})[name] || []
    };
    const image = Namespace.prototype.getDBSolveImage.call(ns, 'keep', 'tags[0]', '26');
    expect(image.discreteEvents[0].switcher).to.equal(d);
    expect(image.continuousEvents[0].switcher).to.equal(c);
    expect(entries).to.deep.equal([
      {level: 'error', msg: 'DBSolve supports only simple comparison operators in DSwitcher trigger, got: "a and b"', opt: {diagnosticCode: 'DBSOLVE_UNSUPPORTED_CONDITION', id: 'd', space: 'model', expression: 'a and b', path: 'trigger', format: 'dbsolve'}},
      {level: 'warn', msg: 'DBSolve does not support CSwitcher, got: "c. It will be transformed to DSwitcher"', opt: {diagnosticCode: 'DBSOLVE_CEVENT_CONVERTED_TO_DEVENT', space: 'model', id: 'c', format: 'dbsolve'}}
    ]);
  });

  it('reports Simbio unit constraints and conversion warnings without changing the image', () => {
    const {logger, entries} = capture();
    const term = {equal: () => false, toString: () => 'time'};
    const species = [
      {isAmount: true, index: 'missing'},
      {isAmount: true, index: 'unknown', unitsParsed: {toTerm: () => undefined}},
      {isAmount: true, index: 'wrong', unitsParsed: {toTerm: () => term}, legalTerms: [term]}
    ];
    const reaction = {id: 'reaction', index: 'reaction', assignments: {ode_: {calcUnit: () => ({toTerm: () => term})}}, legalTerms: [term]};
    const unknownReaction = {id: 'unknownReaction', index: 'unknownReaction', assignments: {ode_: {calcUnit: () => ({toTerm: () => undefined})}}, legalTerms: [term]};
    const ns = {spaceName: 'model', container: {logger, functionDefStorage: new Map()},
      selectByInstanceOf: name => name === 'Species' ? species : [unknownReaction, reaction],
      selectByClassName: name => name === 'TimeSwitcher' ? [{id: 't1'}] : [{id: 'c1'}]};
    const image = Namespace.prototype.getSimbioImage.call(ns);
    expect(image.population).to.equal(ns);
    expect(image.listOfFunctionDefinitions).to.deep.equal([]);
    expect(codes(entries)).to.deep.equal(['MISSING_UNIT', 'UNIT_TERM_UNCOMPUTABLE', 'UNIT_TERM_MISMATCH', 'UNIT_TERM_UNCOMPUTABLE', 'SIMBIO_REACTION_UNIT_TERM_MISMATCH', 'SBML_TIME_EVENT_CONVERTED_TO_DEVENT', 'SBML_CEVENT_CONVERTED_TO_DEVENT']);
    expect(entries.map(x => x.level)).to.deep.equal(['error', 'error', 'error', 'error', 'error', 'warn', 'warn']);
    expect(entries[3].opt).to.deep.equal({diagnosticCode: 'UNIT_TERM_UNCOMPUTABLE', space: 'model', id: 'unknownReaction', format: 'simbio'});
  });

  it('continues SBML export after expected unit conversion failures', () => {
    const {logger, entries} = capture();
    const unsupported = Unit.fromQ([{kind: 'unconvertible_unit'}]);
    unsupported[0].kindObj = {};
    const valid = Unit.fromQ([{kind: 'second'}]);
    const ns = {container: {logger, functionDefStorage: new Map(), _builder: {}}, spaceName: 'model', isAbstract: false,
      getUniqueUnits: () => [unsupported, valid],
      selectByClassName: name => name === 'TimeSwitcher' ? [{id: 't1'}] : [{id: 'c1'}]};
    const image = Namespace.prototype.getSBMLImage.call(ns);
    expect(image.listOfUnitDefinitions).to.have.length(1);
    expect(codes(entries)).to.deep.equal(['UNIT_CONVERSION_UNAVAILABLE', 'SBML_TIME_EVENT_CONVERTED_TO_DEVENT', 'SBML_CEVENT_CONVERTED_TO_DEVENT']);
    expect(entries[0].opt).to.include({unit: 'unconvertible_unit', space: 'model', unitExpression: 'unconvertible_unit'});
    entries.length = 0;
    ns.getUniqueUnits = () => { throw Object.assign(new Error('other unit failure'), {diagnosticCode: 'UNIT_MISMATCH'}); };
    expect(() => Namespace.prototype.getSBMLImage.call(ns)).to.throw('other unit failure');
    expect(entries).to.be.empty;
    entries.length = 0;
    ns.getUniqueUnits = () => { throw new Error('unexpected failure'); };
    expect(() => Namespace.prototype.getSBMLImage.call(ns)).to.throw('unexpected failure');
    expect(entries).to.be.empty;
  });

  it('reports mrgsolve event stability separately from data loss', () => {
    const {logger, entries} = capture();
    const image = {events: [{id: 'd', trigger: {type: 'conditional'}}, {id: 't', trigger: {type: 'time'}}], dynamic: [{id: 'x'}], timeEvents: [{id: 't'}]};
    const ns = {container: {logger}, spaceName: 'model', makeDynMSModel: () => image};
    expect(Namespace.prototype.getMrgsolveImage.call(ns)).to.equal(image);
    expect(image.dynamicStatesIndex).to.deep.equal({x: 1});
    expect(image.timeEventIndex).to.deep.equal({t: 10});
    expect(entries[0].opt).to.deep.equal({events: ['d'], diagnosticCode: 'MRGSOLVE_EVENT_STABILITY_RISK', space: 'model', format: 'mrgsolve'});
    expect(entries[0].level).to.equal('warn');
  });

  it('exports selected DynMS scenarios and rejects a scenario without tspan', () => {
    const builder = new Builder();
    const entries = [];
    builder.logger.addTransport((level, msg, opt) => entries.push({level, msg, opt}));
    const exporter = new builder.exportClasses.dynms({});
    exporter.selectedNamespaces = () => [['model', {makeDynMSModel: () => ({id: 'model'})}]];
    builder.container.scenarioStorage.set('good', {id: 'good', model: 'model', tspan: [0, 1]});
    builder.container.scenarioStorage.set('filtered', {id: 'filtered', model: 'other'});
    const outputs = exporter.makeText();
    const result = JSON.parse(outputs[0].content);
    expect(result.models).to.deep.equal([{id: 'model'}]);
    expect(result.scenarios).to.deep.equal([{id: 'good', model: 'model', tspan: [0, 1]}]);
    expect(entries).to.deep.equal([]);
    builder.container.scenarioStorage.set('bad', {id: 'bad', model: 'model'});
    expect(() => exporter.makeText()).to.throw(Error, 'Scenario "bad" cannot be exported to DynMS because "tspan" is required.');
    entries.length = 0;
    exporter.exprFormat = 'invalid';
    exporter.selectedNamespaces = () => [];
    expect(() => exporter.makeText()).to.throw(Error, 'Unsupported expression format: invalid');
    expect(entries).to.deep.equal([]);
  });

  it('reports unsupported SBML versions and keeps their empty output', () => {
    const builder = new Builder();
    const entries = [];
    builder.logger.addTransport((level, msg, opt) => entries.push({level, msg, opt}));
    const exporter = new builder.exportClasses.sbml({version: 'L1V1'});
    expect(exporter.getSBMLCode()).to.equal('');
    expect(entries).to.deep.equal([{level: 'error', msg: 'SBML version "L1V1" is not supported.', opt: {diagnosticCode: 'SBML_UNSUPPORTED_VERSION', format: 'sbml', version: 'L1V1'}}]);
  });

  it('marks cyclic DynMS rule dependencies on the thrown error', () => {
    const rules = ['a', 'b'].map((id, i) => ({id, isRule: true, assignments: {ode_: Expression.fromString(i ? 'a' : 'b')}}));
    const ns = {selectByClassName: () => [], selectByInstanceOf: name => name === 'Record' ? rules : []};
    try {
      Namespace.prototype.makeDynMSModel.call(ns);
      throw new Error('expected a cycle');
    } catch (error) {
      expect(error.message).to.match(/^Circular dependency in expressions:/);
      expect(error.opt.circular).to.include.members(['a', 'b']);
      expect(error.opt.diagnosticCode).to.equal('CIRCULAR_RECORD_DEPENDENCY');
    }
    const TopoSort = require('@insysbio/topo-sort');
    const originalSort = TopoSort.prototype.sort;
    const unexpected = new Error('unexpected graph failure');
    try {
      TopoSort.prototype.sort = () => { throw unexpected; };
      expect(() => Namespace.prototype.makeDynMSModel.call(ns)).to.throw(unexpected);
    } finally {
      TopoSort.prototype.sort = originalSort;
    }
  });
});
