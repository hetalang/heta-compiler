/* global describe, it */
const { expect } = require('chai');
const yaml = require('js-yaml');
const { xml2js } = require('xml-js');
const HetaLevelError = require('../../src/heta-level-error');
const jsonLoader = require('../../src/module-system/json-module');
const yamlLoader = require('../../src/module-system/yaml-module');
const sbmlLoader = require('../../src/module-system/sbml-module');
const { SBMLParse } = require('../../src/module-system/sbml-parse');
const ModuleSystem = require('../../src/module-system');
const { Logger, JSONTransport } = require('../../src/logger');

function caught(fn) {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('Expected an error');
}

describe('Module input errors', () => {
  const model = (body) => `<sbml><model>${body}</model></sbml>`;
  const cases = [
    {type: 'heta', input: '@@@'},
    {type: 'json', input: '{'},
    {type: 'yaml', input: '['},
    {type: 'sbml', input: '<sbml><model></sbml>'},
    {type: 'sbml', input: model('<listOfRules><assignmentRule variable="x"><math><unknown/></math></assignmentRule></listOfRules>')}
  ];

  cases.forEach(({type, input}, index) => {
    it(`logs ${type} input error as an expected module error (${index})`, () => {
      const events = [];
      const logger = new Logger().addTransport(new JSONTransport('debug', events));
      const modules = new ModuleSystem(logger, () => input);
      expect(modules.createModule('model', type)).to.deep.equal([]);
      const errors = events.filter((event) => event.level === 'error');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].msg).to.include('model');
      expect(errors[0].opt).to.deep.equal({type: 'ModuleError', filename: 'model'});
      expect(logger.hasErrors).to.equal(true);
    });
  });

  it('preserves the modern JSON parser error message', () => {
    const original = caught(() => JSON.parse('{'));
    const error = caught(() => jsonLoader('{'));
    expect(original).to.be.instanceOf(SyntaxError);
    expect(error).to.be.instanceOf(HetaLevelError);
    expect(error.message).to.include(original.message);
    expect(error).not.to.have.property('cause');
  });

  it('preserves JSON error coordinates when the parser reports a position', () => {
    const original = JSON.parse;
    const parserError = new SyntaxError('Unexpected token at position 2');
    try {
      JSON.parse = () => { throw parserError; };
      const error = caught(() => jsonLoader('[\n?]'));
      expect(error).to.be.instanceOf(HetaLevelError);
      expect(error.message).to.include(parserError.message);
      expect(error.message).to.include('(2:0 in JSON)');
      expect(error.coordinate).to.deep.equal({line: 2, column: 0, position: 2});
    } finally {
      JSON.parse = original;
    }
  });

  it('preserves YAML and XML parser error messages', () => {
    const originalYaml = caught(() => yaml.load('['));
    const yamlError = caught(() => yamlLoader('['));
    expect(originalYaml).to.be.instanceOf(yaml.YAMLException);
    expect(yamlError).to.be.instanceOf(HetaLevelError);
    expect(yamlError.message).to.equal(originalYaml.message);
    expect(yamlError).not.to.have.property('cause');

    const source = '<sbml><model></sbml>';
    const original = caught(() => xml2js(source, {compact: false}));
    const xmlError = caught(() => sbmlLoader(source));
    expect(xmlError).to.be.instanceOf(HetaLevelError);
    expect(xmlError.message).to.equal(original.message);
    expect(xmlError).not.to.have.property('cause');
  });

  it('does not convert unexpected JSON or YAML errors', () => {
    const jsonParse = JSON.parse;
    const yamlLoad = yaml.load;
    const failure = new Error('unexpected failure');
    try {
      JSON.parse = () => { throw failure; };
      yaml.load = () => { throw failure; };
      expect(caught(() => jsonLoader('{}'))).to.equal(failure);
      expect(caught(() => yamlLoader('{}'))).to.equal(failure);
    } finally {
      JSON.parse = jsonParse;
      yaml.load = yamlLoad;
    }
  });

  it('does not convert unexpected SBML preprocessing errors', () => {
    const failure = new Error('unexpected failure');
    expect(caught(() => SBMLParse({replace() { throw failure; }}))).to.equal(failure);
  });

  it('preserves successful JSON and YAML loading', () => {
    expect(jsonLoader('[{"id":"x"}]')).to.deep.equal([{id: 'x'}]);
    expect(yamlLoader('- id: x')).to.deep.equal([{id: 'x'}]);
  });
});
