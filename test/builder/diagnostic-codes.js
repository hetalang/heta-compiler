/* global describe, it */
const { expect } = require('chai');
const path = require('path');
const { Builder } = require('../../src');
const { Logger, JSONTransport } = require('../../src/logger');
const HetaLevelError = require('../../src/heta-level-error');
const { version } = require('../../package.json');

function attempt(declaration) {
  const events = [];
  const logger = new Logger().addTransport(new JSONTransport('debug', events));
  let caughtError;
  try {
    new Builder(declaration, undefined, undefined, logger);
  } catch (error) {
    caughtError = error;
  }
  return {events, error: caughtError};
}

describe('Builder platform diagnostic codes', () => {
  it('preserves declaration schema details with distinct diagnostic codes', () => {
    const type = attempt({notes: 1});
    expect(type.error).to.equal(undefined);
    expect(type.events.some((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_PROPERTY_TYPE')).to.equal(true);
    expect(type.events.find((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_PROPERTY_TYPE').opt)
      .to.include({path: '/notes', keyword: 'type'});
    const unsupported = attempt({importModule: {type: 'invalid'}});
    expect(unsupported.events.find((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_VALUE').opt)
      .to.include({path: '/importModule/type', keyword: 'enum'});
    const outOfRange = attempt({importModule: {omitRows: -1}});
    expect(outOfRange.events.find((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_VALUE').opt)
      .to.include({path: '/importModule/omitRows', keyword: 'minimum'});
    const unknown = attempt({options: {invalid: true}});
    expect(unknown.events.some((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_UNKNOWN_PROPERTY')).to.equal(true);
  });

  it('distinguishes malformed and incompatible version requirements', () => {
    for (const [requirement, code] of [
      ['not a range', 'INVALID_COMPILER_VERSION_REQUIREMENT'],
      ['<0.0.0', 'INCOMPATIBLE_COMPILER_VERSION']
    ]) {
      const events = [];
      const logger = new Logger().addTransport(new JSONTransport('debug', events));
      const builder = new Builder({builderVersion: requirement}, undefined, undefined, logger);
      expect(builder.run()).to.equal(builder);
      expect(builder.logger.hasErrors).to.equal(true);
      const event = events.find((entry) => entry.opt?.diagnosticCode === code);
      expect(event.opt).to.deep.equal({diagnosticCode: code, range: requirement,
        ...(code === 'INCOMPATIBLE_COMPILER_VERSION' ? {version} : {})});
    }
  });

  it('distinguishes an absolute export path and unknown export format', () => {
    const result = attempt({export: [{format: 'unknown', filepath: path.resolve('output')}]});
    const codes = result.events.filter((event) => event.level === 'error').map((event) => event.opt.diagnosticCode);
    expect(codes).to.include.members(['ABSOLUTE_EXPORT_PATH', 'UNKNOWN_EXPORT_FORMAT']);
  });

  it('logs a main-module path failure and stops the build', () => {
    const events = [];
    const logger = new Logger().addTransport(new JSONTransport('debug', events));
    const builder = new Builder({importModule: {source: path.resolve('input.heta')}}, undefined, undefined, logger);
    expect(builder.run()).to.equal(builder);
    expect(events.find((event) => event.opt?.diagnosticCode === 'ABSOLUTE_MODULE_PATH').opt)
      .to.deep.equal({diagnosticCode: 'ABSOLUTE_MODULE_PATH', source: path.resolve('input.heta'), target: 'PLATFORM'});
    expect(builder.logger.hasErrors).to.equal(true);
  });

  it('logs empty platforms and skipped unit checks without diagnostic codes', () => {
    const builder = new Builder({importModule: {source: 'model.json', type: 'json'}}, () => '[]').run();
    const warnings = builder.container.defaultLogs.filter((event) => event.level === 'warn');
    expect(warnings.find((event) => event.msg === 'Empty platform. No elements were loaded.').opt?.diagnosticCode).to.equal(undefined);
    expect(warnings.find((event) => event.msg.startsWith('Units checking skipped.')).opt?.diagnosticCode).to.equal(undefined);

    const constants = '[{"id":"missing","class":"Const","num":1},{"id":"specified","class":"Const","num":2,"units":"mole"},{"id":"dimensionless","class":"Const","num":3,"units":1},{"id":"extraTime","class":"TimeScale"},{"id":"definedTime","class":"TimeScale","units":"second"}]';
    for (const unitsCheck of [false, true]) {
      const result = new Builder({options: {unitsCheck}, importModule: {source: 'model.json', type: 'json'}}, () => constants).run();
      const missingUnits = result.container.defaultLogs.filter((event) => event.opt?.diagnosticCode === 'MISSING_UNIT');
      expect(missingUnits.map((event) => event.opt.id)).to.deep.equal(unitsCheck ? ['missing'] : []);
      if (unitsCheck) expect(missingUnits[0].opt).to.include({space: 'nameless', path: 'units'});
      const missingTime = result.container.defaultLogs.filter((event) => event.opt?.diagnosticCode === 'UNDEFINED_TIME_UNIT');
      expect(missingTime.map((event) => event.opt.id)).to.have.members(unitsCheck ? ['t', 'extraTime'] : []);
      expect(missingTime.every((event) => event.level === 'warn' && event.opt.path === 'units')).to.equal(true);
    }

    const modelWithMissingUnits = 'x @Record .= 1; y @Record {units: mole} .= x * 5;';
    const checkedUnits = new Builder({options: {unitsCheck: true}, importModule: {source: 'model.heta', type: 'heta'}}, () => modelWithMissingUnits).run();
    const unitWarnings = checkedUnits.container.defaultLogs.filter((event) => ['MISSING_UNIT', 'UNIT_CALCULATION_FAILED'].includes(event.opt?.diagnosticCode));
    expect(unitWarnings.map((event) => [event.opt.diagnosticCode, event.opt.id])).to.deep.equal([
      ['MISSING_UNIT', 'x'], ['UNIT_CALCULATION_FAILED', 'y']
    ]);

    const writes = [];
    const exportsBuilder = new Builder({export: [{format: 'json'}, {format: 'yaml'}]}, undefined,
      (filename, content) => writes.push({filename, content}));
    exportsBuilder.exportArray[0].make = () => {
      throw new HetaLevelError('Not enough arguments', {diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: 'f'});
    };
    exportsBuilder.exportArray[1].make = () => [{pathSuffix: '.yml', content: 'ok'}];
    exportsBuilder.exportMany();
    expect(writes).to.have.length(1);
    expect(writes[0].filename).to.match(/yaml\.yml$/);
    expect(exportsBuilder.container.hetaErrors().at(-1).opt).to.deep.equal({
      diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: 'f', format: 'json'
    });
    expect(exportsBuilder.logger.hasErrors).to.equal(true);
    const unexpected = new Error('internal export failure');
    exportsBuilder.exportArray[0].make = () => { throw unexpected; };
    expect(() => exportsBuilder.exportMany()).to.throw(unexpected);

    const model = '#defineFunction f { arguments: [x,y], math: x+y }; z @Record .= f(1,2)+f(1);';
    const output = [];
    const checked = new Builder({importModule: {source: 'model.heta', type: 'heta'}, export: [{format: 'dynms'}]},
      () => model, (filename) => output.push(filename)).run();
    const argumentError = checked.container.defaultLogs.find((event) => event.opt?.diagnosticCode === 'FUNCTION_ARGUMENT_COUNT');
    expect(argumentError.opt).to.include({id: 'z', functionId: 'f', providedArguments: 1, requiredArguments: 2});
    expect(argumentError.opt).not.to.have.property('format');
    expect(output).to.be.empty;
  });
});
