/* global describe, it */
const { expect } = require('chai');
const path = require('path');
const XLSX = require('xlsx');
const ModuleSystem = require('../../src/module-system');
const HetaLevelError = require('../../src/heta-level-error');
const heta = require('../../src/module-system/heta-module');
const json = require('../../src/module-system/json-module');
const yaml = require('../../src/module-system/yaml-module');
const sbml = require('../../src/module-system/sbml-module');
const table = require('../../src/module-system/table-module');
const {convertExcelSync, WorksheetNotFoundError, TableHeaderError} = require('../../src/xlsx-connector');
const { _toMathExpr } = require('../../src/module-system/to-math-expr');
const { Logger, JSONTransport } = require('../../src/logger');

function caught(fn) {
  try { fn(); } catch (error) { return error; }
  throw new Error('Expected an error');
}
function system(reader) {
  const events = [];
  const logger = new Logger().addTransport(new JSONTransport('debug', events));
  return { modules: new ModuleSystem(logger, reader), events, logger };
}
function workbook(rows) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  return XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
}
const model = (body) => `<sbml><model>${body}</model></sbml>`;
const rule = (math) => model(`<listOfRules><assignmentRule variable="x">${math}</assignmentRule></listOfRules>`);

describe('Module diagnostic codes', () => {
  for (const [type, loader, input] of [
    ['heta', heta, '@@@'], ['json', json, '{'], ['yaml', yaml, '['],
    ['sbml', sbml, '<sbml><model></sbml>']
  ]) {
    it(`uses the same syntax code for malformed ${type} and preserves the exception`, () => {
      const error = caught(() => loader(input));
      expect(error).to.be.instanceOf(HetaLevelError);
      expect(error.opt.diagnosticCode).to.equal('MODULE_SYNTAX_ERROR');
      const { modules, events, logger } = system(() => input);
      expect(modules.createModule('model', type)).to.deep.equal([]);
      const event = events.find((e) => e.level === 'error');
      expect(event.msg).to.equal(`${error.message} when converting module "model"`);
      expect(event.opt).to.deep.equal({...error.opt, filename: 'model'});
      expect(logger.hasErrors).to.equal(true);
    });
  }

  it('reports missing files and unsupported types', () => {
    const missing = Object.assign(new Error('file missing'), {code: 'ENOENT'});
    const {modules, events} = system(() => { throw missing; });
    expect(modules.createModule('absent', 'heta')).to.deep.equal([]);
    expect(events.find((e) => e.level === 'error')).to.include({msg: 'file missing'});
    expect(events.find((e) => e.level === 'error').opt).to.deep.equal({filename: 'absent', diagnosticCode: 'UNAVAILABLE_MODULE', systemCode: 'ENOENT'});
    expect(missing).not.to.have.property('diagnosticCode');
    expect(modules.createModule('model', 'unknown')).to.deep.equal([]);
    expect(events.filter((e) => e.level === 'error')[1].opt).to.deep.equal({filename: 'model', diagnosticCode: 'UNSUPPORTED_MODULE_TYPE', type: 'unknown'});
    expect(modules.createModule('model', 'toString')).to.deep.equal([]);
    expect(events.filter((e) => e.level === 'error')[2].opt).to.deep.equal({filename: 'model', diagnosticCode: 'UNSUPPORTED_MODULE_TYPE', type: 'toString'});
    expect(modules.createModule('model', null)).to.deep.equal([]);
    expect(events.filter((e) => e.level === 'error')[3].msg).to.include('null (null)');
  });

  it('tags absolute include paths and circular includes while preserving continuation', () => {
    const absolute = path.resolve('outside.heta');
    const {modules, events} = system(() => JSON.stringify([{action: 'include', source: absolute, type: 'heta'}]));
    const parsed = modules.addModuleDeep('model.json', 'json');
    expect(parsed[0].source).to.equal('');
    expect(events.find((e) => e.level === 'error').opt).to.deep.equal({source: absolute, target: 'model.json', diagnosticCode: 'ABSOLUTE_MODULE_PATH'});
    expect(modules.integrate()).to.deep.equal([]);
    const circular = system(() => '[{"action":"include","source":"a.json","type":"json"}]').modules;
    circular.addModuleDeep('a.json', 'json');
    const error = caught(() => circular.sortedPaths());
    expect(error).to.be.instanceOf(HetaLevelError);
    expect(error.opt.diagnosticCode).to.equal('CIRCULAR_MODULE_INCLUDES');
    expect(error.opt.circular).to.include('a.json#0');
    const failure = new Error('internal graph error');
    circular.graph.sort = () => { throw failure; };
    expect(caught(() => circular.sortedPaths())).to.equal(failure);
    expect(failure).not.to.have.property('diagnosticCode');
    for (const source of [undefined, null, 4, '', '  ']) {
      const invalid = system(() => JSON.stringify([{action: 'include', source}]));
      invalid.modules.addModuleDeep('model.json', 'json');
      expect(invalid.modules.integrate()).to.deep.equal([]);
      expect(invalid.events.find((event) => event.opt?.diagnosticCode === 'INVALID_MODULE_SOURCE').opt)
        .to.include({filename: 'model.json', source});
    }
  });

  it('propagates table validation codes for both xlsx and table aliases', () => {
    const content = workbook([['on', 'id'], [true, 'x']]);
    const missingSheet = caught(() => convertExcelSync(content, null, {sheet: 2}));
    expect(missingSheet).to.be.instanceOf(WorksheetNotFoundError).and.not.instanceOf(HetaLevelError);
    expect(missingSheet.sheet).to.equal(2);
    expect(missingSheet.message).to.equal('Table worksheet at index 2 was not found.');
    const invalidHeader = caught(() => convertExcelSync(workbook([['bad-header'], ['x']])));
    expect(invalidHeader).to.be.instanceOf(TableHeaderError).and.not.instanceOf(HetaLevelError);
    expect(invalidHeader).to.include({header: 'bad-header', part: 'bad-header'});
    for (const type of ['xlsx', 'table']) {
      for (const [options, code] of [[{sheet: -1}, 'TABLE_INVALID_SHEET_OPTION'], [{omitRows: -1}, 'TABLE_INVALID_OMIT_ROWS_OPTION'], [{sheet: 2}, 'TABLE_MISSING_SHEET']]) {
        const {modules, events} = system(() => content);
        expect(modules.createModule('book', type, options)).to.deep.equal([]);
        const event = events.find((e) => e.level === 'error');
        expect(event.opt).to.deep.equal({filename: 'book', diagnosticCode: code,
          ...(code === 'TABLE_MISSING_SHEET' ? {sheet: 2} : {path: code === 'TABLE_INVALID_SHEET_OPTION' ? 'sheet' : 'omitRows', value: -1})});
        if (code === 'TABLE_MISSING_SHEET') expect(event.msg).to.equal('Table worksheet at index 2 was not found. when converting module "book#2"');
      }
      const {modules, events} = system(() => workbook([['bad-header'], ['x']]));
      expect(modules.createModule('book', type)).to.deep.equal([]);
      expect(events.find((e) => e.level === 'error').opt).to.deep.equal({filename: 'book', diagnosticCode: 'TABLE_INVALID_HEADER', header: 'bad-header', part: 'bad-header', sheet: 0});
    }
    expect(caught(() => table(content, {sheet: -1}))).to.be.instanceOf(HetaLevelError).with.property('opt').that.has.property('diagnosticCode', 'TABLE_INVALID_SHEET_OPTION');
    expect(caught(() => table(content, {omitRows: -1}))).to.be.instanceOf(HetaLevelError).with.property('opt').that.has.property('diagnosticCode', 'TABLE_INVALID_OMIT_ROWS_OPTION');
    expect(caught(() => table(content, {transpose: 'false'})).opt).to.deep.equal({diagnosticCode: 'TABLE_INVALID_TRANSPOSE_OPTION', path: 'transpose', value: 'false'});
    for (const second of [{omitRows: 1}, {transpose: true}, {omitRows: 0, transpose: false}]) {
      const entries = [{action: 'include', source: 'book.xlsx', type: 'table'}, {action: 'include', source: 'book.xlsx', type: 'xlsx', ...second}];
      const result = system((filename) => filename === 'model.json' ? JSON.stringify(entries) : content);
      result.modules.addModuleDeep('model.json', 'json');
      result.modules.integrate();
      const error = result.events.find((event) => event.opt?.diagnosticCode === 'TABLE_CONFLICTING_OPTIONS');
      if (second.omitRows === 0) expect(error).to.equal(undefined);
      else expect(error.opt).to.include({filename: 'book.xlsx', sheet: 0});
    }
  });

  it('distinguishes malformed MathML from internal exceptions', () => {
    for (const math of ['<math><unknown/></math>', '<math/>', '<math><apply><gt/><cn>1</cn></apply></math>', '<math><piecewise><piece/></piecewise></math>', '<math><apply><root/><degree/></apply></math>']) {
      const error = caught(() => sbml(rule(math)));
      expect(error).to.be.instanceOf(HetaLevelError);
      expect(error.opt.diagnosticCode).to.equal('INVALID_SBML_EXPRESSION');
      expect(error.opt).to.have.property('element');
      expect(error.opt).to.have.property('reason');
      const {modules, events} = system(() => rule(math));
      expect(modules.createModule('model.xml', 'sbml')).to.deep.equal([]);
      expect(events.find((e) => e.level === 'error').opt).to.deep.equal({...error.opt, filename: 'model.xml'});
    }
    const failure = new TypeError('internal failure');
    const malformedObject = {get name() { throw failure; }};
    expect(caught(() => _toMathExpr(malformedObject))).to.equal(failure);
    expect(failure).not.to.have.property('diagnosticCode');
    const {modules, events} = system(() => { throw failure; });
    expect(caught(() => modules.createModule('model', 'json'))).to.equal(failure);
    expect(events.find((e) => e.level === 'error')).to.equal(undefined);
    const processing = system(() => ({toString() { throw failure; }}));
    expect(processing.modules.createModule('model', 'json')).to.deep.equal([]);
    expect(processing.events.find((e) => e.level === 'error').opt).to.deep.equal({
      filename: 'model', diagnosticCode: 'MODULE_PROCESSING_ERROR', stack: failure.stack
    });
    const expected = new HetaLevelError('Invalid input', {diagnosticCode: 'MODULE_SYNTAX_ERROR', component: 'model::x'});
    const modelError = system(() => ({toString() { throw expected; }}));
    expect(modelError.modules.createModule('model', 'json')).to.deep.equal([]);
    expect(modelError.events.find((e) => e.level === 'error').opt).to.deep.equal({
      diagnosticCode: 'MODULE_SYNTAX_ERROR', component: 'model::x', filename: 'model'
    });
    for (const value of [undefined, null]) {
      const invalidReader = system(() => value);
      const error = caught(() => invalidReader.modules.createModule('model', 'json'));
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal(`File read handler returned ${value} for module "model".`);
      expect(error).not.to.have.property('diagnosticCode');
    }
    const unrelated = Object.assign(new Error('internal ENOENT'), {code: 'ENOENT'});
    const second = system(() => ({toString() { throw unrelated; }}));
    expect(caught(() => second.modules.createModule('model', 'json'))).to.equal(unrelated);
    expect(second.events.find((e) => e.level === 'error')).to.equal(undefined);
    expect(unrelated).not.to.have.property('diagnosticCode');
  });

  it('classifies missing SBML function bodies as invalid SBML expressions', () => {
    const input = model('<listOfFunctionDefinitions><functionDefinition id="f"><math><lambda><bvar><ci>x</ci></bvar></lambda></math></functionDefinition></listOfFunctionDefinitions>');
    const error = caught(() => sbml(input));
    expect(error).to.be.instanceOf(HetaLevelError);
    expect(error.opt).to.deep.equal({diagnosticCode: 'INVALID_SBML_EXPRESSION', id: 'f', element: 'lambda', reason: 'missing_body'});
    const {modules, events} = system(() => input);
    expect(modules.createModule('model.xml', 'sbml')).to.deep.equal([]);
    expect(events.find((event) => event.level === 'error').opt.diagnosticCode).to.equal('INVALID_SBML_EXPRESSION');
  });

  it('distinguishes SBML validation problems and unsupported features', () => {
    const cases = [
      ['<foo/>', 'INVALID_SBML_DOCUMENT'],
      [model('<listOfRules><algebraicRule/></listOfRules>'), 'UNSUPPORTED_SBML_ALGEBRAIC_RULE'],
      [model('<listOfFunctionDefinitions><functionDefinition id="f"/></listOfFunctionDefinitions>'), 'INVALID_SBML_FUNCTION_DEFINITION'],
      [model('<listOfSpecies><species id="s" compartment="missing" substanceUnits="mole"/></listOfSpecies>'), 'INVALID_SBML_REFERENCE'],
      [model('<listOfReactions><reaction id="r" fast="true"/></listOfReactions>'), 'UNSUPPORTED_SBML_FAST_REACTION'],
      [model('<listOfEvents><event><delay/></event></listOfEvents>'), 'UNSUPPORTED_SBML_EVENT_DELAY'],
      [rule('<math><infinity/></math>'), 'UNSUPPORTED_SBML_NONFINITE_NUMBER'],
      [rule('<math><csymbol definitionURL="other"/></math>'), 'UNSUPPORTED_SBML_CSYMBOL'],
      [rule('<math><csymbol definitionURL="http://www.sbml.org/sbml/symbols/delay"/></math>'), 'UNSUPPORTED_SBML_DELAY_SYMBOL']
    ];
    for (const [input, code] of cases) {
      const error = caught(() => sbml(input));
      expect(error).to.be.instanceOf(HetaLevelError);
      expect(error.opt.diagnosticCode).to.equal(code);
      if (code === 'INVALID_SBML_REFERENCE') {
        expect(error.opt).to.deep.equal({diagnosticCode: code, id: 's', reference: 'missing', path: 'compartment'});
        const {modules, events} = system(() => input);
        expect(modules.createModule('model.xml', 'sbml')).to.deep.equal([]);
        expect(events.find((event) => event.level === 'error').opt)
          .to.deep.equal({...error.opt, filename: 'model.xml'});
      }
      if (code === 'INVALID_SBML_FUNCTION_DEFINITION') {
        expect(error.opt).to.deep.equal({diagnosticCode: code, id: 'f', element: 'math', reason: 'missing'});
        const {modules, events} = system(() => input);
        expect(modules.createModule('model.xml', 'sbml')).to.deep.equal([]);
        expect(events.find((event) => event.level === 'error').opt).to.deep.equal({...error.opt, filename: 'model.xml'});
      }
    }
    for (const [list, parameter] of [['listOfParameters', 'parameter'], ['listOfLocalParameters', 'localParameter']]) {
      const input = model(`<listOfReactions><reaction id="r"><kineticLaw><${list}><${parameter} id="k" value="2"/><notes id="ignored"/></${list}></kineticLaw></reaction></listOfReactions>`);
      const result = sbml(input);
      expect(result.find((item) => item.id === 'k__r_local')).to.include({class: 'Const', num: 2});
      expect(result.some((item) => item.id === 'ignored__r_local')).to.equal(false);
    }
    const missingLambda = model('<listOfFunctionDefinitions><functionDefinition id="f"><math><ci>x</ci></math></functionDefinition></listOfFunctionDefinitions>');
    expect(caught(() => sbml(missingLambda)).opt).to.deep.equal({diagnosticCode: 'INVALID_SBML_FUNCTION_DEFINITION', id: 'f', element: 'lambda', reason: 'missing'});
    for (const [input, message, path, reason] of [
      ['<foo/>', 'SBML document does not contain an <sbml> element.', '/sbml', 'missing'],
      ['<sbml/>', 'The <sbml> element has no child elements; a <model> element is required.', '/sbml', 'empty'],
      ['<sbml><notes/></sbml>', 'The <sbml> element does not contain a <model> element.', '/sbml/model', 'missing'],
      ['<sbml><model/></sbml>', 'The <model> element has no child elements.', '/sbml/model', 'empty']
    ]) {
      const error = caught(() => sbml(input));
      expect(error.message).to.equal(message);
      expect(error.opt).to.deep.equal({diagnosticCode: 'INVALID_SBML_DOCUMENT', path, reason});
    }
    for (const list of ['listOfProducts', 'listOfReactants']) {
      const input = model(`<listOfReactions><reaction id="r"><${list}><speciesReference><stoichiometryMath/></speciesReference></${list}></reaction></listOfReactions>`);
      expect(caught(() => sbml(input)).opt.diagnosticCode).to.equal('UNSUPPORTED_SBML_STOICHIOMETRY_MATH');
    }
    for (const operator of ['eq', 'neq']) {
      const input = model(`<listOfEvents><event><trigger><math><apply><${operator}/><cn>1</cn><cn>2</cn></apply></math></trigger></event></listOfEvents>`);
      expect(caught(() => sbml(input, {useCSwitcher: true})).opt.diagnosticCode).to.equal('UNSUPPORTED_SBML_EQUALITY_TRIGGER');
    }
  });

  it('retains rate-rule warning metadata and valid modules', () => {
    const input = model('<listOfSpecies><species id="s" compartment="c"/></listOfSpecies><listOfRules><rateRule variable="s"><math><cn>1</cn></math></rateRule></listOfRules>');
    const {modules, events, logger} = system(() => input);
    expect(modules.createModule('model.xml', 'sbml')).to.have.lengthOf(3);
    const warning = events.find((e) => e.level === 'warn');
    expect(warning.opt).to.deep.equal({target: 's', compartment: 'c', diagnosticCode: 'SBML_RATE_RULE_CONCENTRATION_SEMANTICS'});
    expect(warning.msg).to.include('exported simulations may differ');
    expect(logger.hasErrors).to.equal(false);
    for (const [type, input] of [['heta', 'x @Const {num: 1};'], ['json', '[{"id":"x"}]'], ['yaml', '- id: x'], ['sbml', model('<listOfParameters><parameter id="x" value="1" constant="true"/></listOfParameters>')]]) {
      const result = system(() => input);
      expect(result.modules.createModule('valid', type)).to.have.lengthOf(1);
      expect(result.events.filter((e) => e.level === 'error' || e.level === 'warn')).to.be.empty;
    }
  });
});
