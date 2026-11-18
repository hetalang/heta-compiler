/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/heta-build.js');
const model = (body) => `<sbml><model>${body}</model></sbml>`;
const cases = [
  {type: 'heta', input: '@@@', diagnosticCode: 'MODULE_SYNTAX_ERROR'},
  {type: 'json', input: '{', diagnosticCode: 'MODULE_SYNTAX_ERROR'},
  {type: 'yaml', input: '[', diagnosticCode: 'MODULE_SYNTAX_ERROR'},
  {type: 'sbml', input: '<sbml><model></sbml>', diagnosticCode: 'MODULE_SYNTAX_ERROR'},
  {type: 'sbml', input: model('<listOfRules><assignmentRule variable="x"><math><unknown/></math></assignmentRule></listOfRules>'), diagnosticCode: 'INVALID_SBML_EXPRESSION'}
];

describe('CLI module input errors', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-module-errors-'));
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: module-errors\n');
  });
  afterEach(() => fs.removeSync(directory));

  cases.forEach(({type, input, diagnosticCode}, index) => {
    it(`reports ${type} input errors as expected compilation failures (${index})`, () => {
      fs.writeFileSync(path.join(directory, 'model'), input);
      const result = spawnSync(process.execPath, [cli, directory, '--skip-updates',
        '--source=model', `--type=${type}`, '--log-format=json'], {encoding: 'utf8'});
      expect(result.status, result.stdout + result.stderr).to.equal(2);
      expect(result.stdout).not.to.include('Internal "Heta compiler" error');
      const events = fs.readJsonSync(path.join(directory, 'build.log'));
      const diagnostic = events.find((event) => event.level === 'error' && event.opt?.diagnosticCode === diagnosticCode);
      expect(diagnostic.msg).to.include('model');
      expect(diagnostic.opt).to.include({filename: 'model', diagnosticCode});
      if (type === 'heta' || type === 'yaml') expect(diagnostic.opt.location).to.be.an('object');
      if (diagnosticCode === 'INVALID_SBML_EXPRESSION') expect(diagnostic.opt).to.include({element: 'unknown', reason: 'unsupported_element'});
      expect(events.some((event) => event.level === 'crit')).to.equal(false);
    });
  });
});
