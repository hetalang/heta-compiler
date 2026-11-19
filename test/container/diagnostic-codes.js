/* global describe, it */
const { expect } = require('chai');
const Container = require('../../src/container');
const HetaLevelError = require('../../src/heta-level-error');

function lastDiagnostic(container) {
  return container.defaultLogs.filter((entry) => entry.level === 'warn' || entry.level === 'error').pop();
}

describe('Container diagnostic codes', () => {
  it('preserves messages, levels and options while identifying action errors', () => {
    const c = new Container();
    const invalidFunction = c.load({action: 'defineFunction', id: 'bad', arguments: ['x'], math: '1 ? 1 : 0'});
    expect(invalidFunction.errored).to.equal(true);
    expect(c.functionDefStorage.has('bad')).to.equal(false);
    expect(lastDiagnostic(c).opt).to.include({diagnosticCode: 'INVALID_EXPRESSION', id: 'bad', path: 'math'});
    c.load({action: 'notAnAction'});
    expect(lastDiagnostic(c)).to.include({level: 'error', msg: 'Action #notAnAction is unknown and will be skipped.'});
    expect(lastDiagnostic(c).opt).to.deep.equal({action: 'notAnAction', diagnosticCode: 'UNKNOWN_ACTION'});
    for (const action of ['load', 'loadMany', 'constructor', 'knitMany']) {
      expect(c.load({action})).to.equal(undefined);
      expect(lastDiagnostic(c).opt).to.deep.equal({action, diagnosticCode: 'UNKNOWN_ACTION'});
    }

    c.insert({id: 'x', class: 'Record', space: 'absent'});
    expect(lastDiagnostic(c)).to.include({level: 'error', msg: '"absent::x" create namespace "absent" before use.'});
    expect(lastDiagnostic(c).opt).to.deep.equal({space: 'absent', id: 'x', action: 'insert', diagnosticCode: 'MISSING_NAMESPACE'});
    expect(lastDiagnostic(c).opt).not.to.have.property('checkId');
  });

  it('uses the same code for equivalent validation conditions across actions', () => {
    const c = new Container();
    const cases = [
      [() => c.update({}), 'MISSING_IDENTIFIER'],
      [() => c.delete({}), 'MISSING_IDENTIFIER'],
      [() => c.select({}), 'MISSING_IDENTIFIER'],
      [() => c.forceInsert({class: 'Record'}), 'MISSING_IDENTIFIER'],
      [() => c.forceInsert({id: '', class: 'Record'}), 'MISSING_IDENTIFIER'],
      [() => c.forceInsert({id: 'bad id', class: 'Record'}), 'INVALID_IDENTIFIER'],
      [() => c.import({fromId: 'x'}), 'MISSING_IDENTIFIER'],
      [() => c.update({id: 'bad id'}), 'INVALID_IDENTIFIER'],
      [() => c.import({id: 'bad id', fromId: 'x'}), 'INVALID_IDENTIFIER'],
      [() => c.update({id: 'x', space: 'absent'}), 'MISSING_NAMESPACE'],
      [() => c.deleteNS({space: 'absent'}), 'MISSING_NAMESPACE'],
      [() => c.importNS({fromSpace: 'absent'}), 'MISSING_NAMESPACE'],
      [() => c.update({id: 'missing'}), 'MISSING_REFERENCE'],
      [() => c.delete({id: 'missing'}), 'MISSING_REFERENCE'],
      [() => c.import({id: 'x', fromId: 'missing', fromSpace: 'nameless'}), 'MISSING_REFERENCE']
    ];
    for (const [run, code] of cases) {
      run();
      expect(lastDiagnostic(c).opt.diagnosticCode).to.equal(code);
    }
    for (const fromId of [undefined, null, '']) {
      c.import({id: 'x', fromId, fromSpace: 'source'});
      expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'MISSING_IMPORT_SOURCE_ID', fromId, fromSpace: 'source', id: 'x', space: 'nameless', action: 'import'});
    }
    for (const fromId of ['bad id', false, 0, 12, ['valid']]) {
      c.import({id: 'x', fromId, fromSpace: 'source'});
      expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'INVALID_IMPORT_SOURCE_ID', fromId, fromSpace: 'source', id: 'x', space: 'nameless', action: 'import'});
    }
  });

  it('preserves forceInsert validation messages and metadata for missing and invalid fields', () => {
    const c = new Container();
    const cases = [
      [{class: 'Record'}, 'MISSING_IDENTIFIER', 'undefined id should not be empty, got "undefined"\n\t- {"class":"Record"}'],
      [{id: 'bad id', class: 'Record'}, 'INVALID_IDENTIFIER', 'bad id id should be string of type ID, got "bad id"\n\t- {"id":"bad id","class":"Record"}'],
      [{id: 'x'}, 'MISSING_CLASS', 'Component "x" requires a "class" property.'],
      [{id: 'x', class: 12}, 'INVALID_CLASS', 'x Class must be string for "insert": 12']
    ];
    for (const [q, code, msg] of cases) {
      expect(c.forceInsert(q)).to.equal(undefined);
      expect(lastDiagnostic(c)).to.include({level: 'error', msg});
      expect(lastDiagnostic(c).opt).to.deep.equal({space: 'nameless', diagnosticCode: code,
        ...(code === 'MISSING_IDENTIFIER' ? {id: undefined, action: 'forceInsert', path: 'id'} : {}),
        ...(code === 'INVALID_IDENTIFIER' ? {id: 'bad id', action: 'forceInsert'} : {}),
        ...(code === 'MISSING_CLASS' || code === 'INVALID_CLASS' ? {id: 'x'} : {}),
        ...(code === 'MISSING_CLASS' ? {action: 'forceInsert'} : {}),
        ...(code === 'INVALID_CLASS' ? {wrongClass: 12} : {})});
    }
    for (const [action, args] of [['forceInsert', {class: 'Record'}], ['update', {}], ['delete', {}], ['select', {}], ['import', {fromId: 'source'}]]) {
      for (const id of ['bad id', false, 0, 12, ['valid']]) {
        c[action]({...args, id});
        expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'INVALID_IDENTIFIER', id, space: 'nameless', action});
      }
    }
  });

  it('distinguishes invalid classes, action restrictions and duplicate components', () => {
    const c = new Container();
    const cases = [
      [() => c.forceInsert({id: 'x'}), 'MISSING_CLASS'],
      [() => c.forceInsert({id: 'x', class: ''}), 'MISSING_CLASS'],
      [() => c.forceInsert({id: 'x', class: 12}), 'INVALID_CLASS'],
      [() => c.forceInsert({id: 'x', class: false}), 'INVALID_CLASS'],
      [() => c.forceInsert({id: 'x', class: null}), 'INVALID_CLASS'],
      [() => c.forceInsert({id: 'x', class: 'Unknown'}), 'INVALID_CLASS'],
      [() => c.forceInsert({id: 'include', class: 'Record'}), 'RESERVED_IDENTIFIER'],
      [() => c.update({id: 'x', class: 'Record'}), 'PROPERTY_NOT_ALLOWED_IN_ACTION'],
      [() => c.delete({id: 'x', class: 'Record'}), 'PROPERTY_NOT_ALLOWED_IN_ACTION'],
      [() => c.importNS({fromId: 'x'}), 'PROPERTY_NOT_ALLOWED_IN_ACTION'],
      [() => c.importNS({id: 'x'}), 'PROPERTY_NOT_ALLOWED_IN_ACTION'],
      [() => c.importNS({}), 'MISSING_SOURCE_NAMESPACE'],
      [() => c.importNS({fromSpace: 1}), 'INVALID_SOURCE_NAMESPACE'],
      [() => c.import({id: 'x'}), 'MISSING_IMPORT_SOURCE_ID'],
      [() => c.import({id: 'x', fromId: 1}), 'INVALID_IMPORT_SOURCE_ID']
    ];
    for (const [run, code] of cases) {
      run();
      expect(lastDiagnostic(c).opt.diagnosticCode).to.equal(code);
    }
    for (const action of ['update', 'delete']) {
      c[action]({id: 'x', class: 'Record'});
      expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action, property: 'class', value: 'Record', id: 'x', space: 'nameless'});
    }
    for (const property of ['id', 'fromId']) {
      c.importNS({[property]: 'x'});
      expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'PROPERTY_NOT_ALLOWED_IN_ACTION', action: 'importNS', property, value: 'x', space: 'nameless'});
    }
    for (const action of ['importNS', 'import']) {
      const input = action === 'import' ? {id: 'x', fromId: 'source'} : {};
      for (const fromSpace of [undefined, null, '', false, 0, 12, ['model']]) {
        c[action]({...input, fromSpace});
        expect(lastDiagnostic(c).opt).to.deep.equal({
          diagnosticCode: fromSpace == null || fromSpace === '' ? 'MISSING_SOURCE_NAMESPACE' : 'INVALID_SOURCE_NAMESPACE',
          action, ...input, space: 'nameless', fromSpace
        });
      }
    }
    c.insert({id: 'x', class: 'Record'});
    c.insert({id: 'x', class: 'Record'});
    expect(lastDiagnostic(c)).to.include({level: 'warn'});
    expect(lastDiagnostic(c).opt).to.deep.equal({space: 'nameless', id: 'x', diagnosticCode: 'COMPONENT_REPLACED'});
    c.forceInsert({id: 'corex', class: 'Record'}, true);
    c.update({id: 'corex'});
    expect(lastDiagnostic(c).opt.diagnosticCode).to.equal('UPDATE_CORE_COMPONENT');
    c.delete({id: 'corex'});
    expect(lastDiagnostic(c).opt.diagnosticCode).to.equal('DELETE_CORE_COMPONENT');
  });

  it('tags inline export diagnostics while retaining their original levels', () => {
    const c = new Container();
    c._builder = {exportClasses: {}, exportArray: [], export: []};
    c.export({format: 'unknown'});
    const logs = c.defaultLogs.filter((entry) => entry.level === 'warn' || entry.level === 'error');
    expect(logs.map((entry) => [entry.level, entry.opt.diagnosticCode])).to.deep.equal([
      ['warn', 'DEPRECATED_INLINE_EXPORT'], ['error', 'UNKNOWN_EXPORT_FORMAT']
    ]);
    for (const format of [undefined, null, '', false, 0, 12]) {
      c.export({format});
      expect(lastDiagnostic(c).opt).to.deep.equal({
        diagnosticCode: format == null || format === '' ? 'MISSING_EXPORT_FORMAT' : 'INVALID_EXPORT_CONFIGURATION',
        action: 'export', path: 'format', format
      });
    }
    c._builder.exportClasses.json = class {};
    c._builder.export.push({});
    c.defaultLogs.length = 0;
    c.export({format: 'json'});
    expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'INLINE_EXPORT_IGNORED'});
  });

  it('dispatches scenario actions and leaves unrelated info metadata unchanged', () => {
    const c = new Container();
    c.defaultLogs.length = 0;
    c.setNS({space: 'model'});
    const info = c.defaultLogs.find((entry) => entry.msg === 'Namespace "model" was set as "concrete"');
    expect(info.opt).to.equal(undefined);
    const scenario = c.load({action: 'setScenario', id: 'scenario1', tspan: [0, 1]});
    expect(scenario.id).to.equal('scenario1');
    expect(c.scenarioStorage.get('scenario1')).to.equal(scenario);
  });

  it('distinguishes cycles in records, unit definitions and function definitions', () => {
    const c = new Container();
    c.loadMany([
      {id: 'a', class: 'Record', assignments: {start_: 'b'}},
      {id: 'b', class: 'Record', assignments: {start_: 'a'}},
      {id: 'ua', action: 'defineUnit', units: 'ub'},
      {id: 'ub', action: 'defineUnit', units: 'ua'},
      {id: 'f', action: 'defineFunction', arguments: ['x'], math: 'f(x)'}
    ]);
    c.knitMany();
    const ns = c.namespaceStorage.get('nameless');
    let caughtError;
    try { ns.sortExpressionsByContext('start_'); } catch (error) { caughtError = error; }
    expect(caughtError.opt).to.have.property('diagnosticCode', 'CIRCULAR_RECORD_DEPENDENCY');
    expect(caughtError.opt.circular).to.include.members(['a', 'b']);
    ns.checkCircRecord('start_');
    expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'CIRCULAR_RECORD_DEPENDENCY', circular: caughtError.opt.circular});
    c.checkCircUnitDef();
    expect(lastDiagnostic(c).opt.diagnosticCode).to.equal('CIRCULAR_UNIT_DEFINITION');
    expect(lastDiagnostic(c).opt.circular).to.include.members(['ua', 'ub']);
    c.checkCircFunctionDef();
    expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'CIRCULAR_FUNCTION_DEFINITION', circular: ['f']});
  });

  it('logs HetaLevelError and propagates other errors during cycle checks', () => {
    const c = new Container();
    const ns = c.namespaceStorage.get('nameless');
    ns.sortExpressionsByContext = () => { throw new HetaLevelError('expected', {diagnosticCode: 'CIRCULAR_RECORD_DEPENDENCY', context: 'start_'}); };
    ns.checkCircRecord('start_');
    expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: 'CIRCULAR_RECORD_DEPENDENCY', context: 'start_'});
    const unexpected = new Error('unexpected');
    ns.sortExpressionsByContext = () => { throw unexpected; };
    expect(() => ns.checkCircRecord('start_')).to.throw(unexpected);
    const other = new HetaLevelError('other', {diagnosticCode: 'INVALID_EXPRESSION'});
    ns.sortExpressionsByContext = () => { throw other; };
    ns.checkCircRecord('start_');
    expect(lastDiagnostic(c).opt).to.deep.equal(other.opt);
  });

  it('classifies cycles and propagates unexpected dependency graph exceptions', () => {
    const TopoSort = require('@insysbio/topo-sort');
    const c = new Container();
    c.loadMany([
      {id: 'r', class: 'Record', assignments: {start_: 'r'}},
      {id: 'u', action: 'defineUnit', units: 'u'},
      {id: 'f', action: 'defineFunction', arguments: ['x'], math: 'f(x)'}
    ]);
    c.knitMany();
    const originalSort = TopoSort.prototype.sort;
    try {
      for (const [id, code, run] of [
        ['r', 'CIRCULAR_RECORD_DEPENDENCY', () => c.namespaceStorage.get('nameless').checkCircRecord('start_')],
        ['u', 'CIRCULAR_UNIT_DEFINITION', () => c.checkCircUnitDef()],
        ['f', 'CIRCULAR_FUNCTION_DEFINITION', () => c.checkCircFunctionDef()]
      ]) {
        TopoSort.prototype.sort = () => { throw Object.assign(new Error('cycle'), {circular: [id], diagnosticCode: 'GRAPH_CODE'}); };
        run();
        expect(lastDiagnostic(c).opt).to.deep.equal({diagnosticCode: code, circular: [id]});
        const unexpected = new Error('unexpected graph failure');
        TopoSort.prototype.sort = () => { throw unexpected; };
        expect(run).to.throw(unexpected);
      }
    } finally {
      TopoSort.prototype.sort = originalSort;
    }
  });

  it('distinguishes uncomputable unit terms from mismatches and missing time units', () => {
    const c = new Container();
    const invalidUnit = c.load({action: 'defineUnit', id: 'brokenUnit', units: 'a^^b'});
    expect(invalidUnit.errored).to.equal(true);
    expect(c.unitDefStorage.has('brokenUnit')).to.equal(false);
    expect(lastDiagnostic(c).opt.diagnosticCode).to.equal('INVALID_UNIT_EXPRESSION');
    c.loadMany([
      {action: 'defineUnit', id: 'unknownTerm', units: [{kind: 'missingUnit'}]},
      {id: 'comp', class: 'Compartment', assignments: {start_: 1}},
      {id: 's1', class: 'Species', compartment: 'comp', units: 'unknownTerm', assignments: {start_: 1}},
      {id: 's2', class: 'Species', compartment: 'comp', units: 'mole', assignments: {start_: 1}}
    ]);
    c.knitMany();
    expect(c.defaultLogs.some((entry) => entry.opt?.diagnosticCode === 'UNKNOWN_UNIT' && entry.opt.unit === 'missingUnit')).to.be.true;
    c.defaultLogs.length = 0;
    c.checkTerms();
    expect(c.defaultLogs.map((entry) => entry.opt.diagnosticCode)).to.have.members(['UNIT_TERM_UNCOMPUTABLE', 'UNIT_TERM_MISMATCH']);
    c.defaultLogs.length = 0;
    c.checkUnits();
    expect(c.defaultLogs.some((entry) => entry.opt && entry.opt.diagnosticCode === 'UNDEFINED_TIME_UNIT')).to.be.true;
  });
});
