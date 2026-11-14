/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/heta-build.js');
const model = (body) => `<sbml><model>${body}</model></sbml>`;
const cases = [
  {type: 'heta', input: '@@@'},
  {type: 'json', input: '{'},
  {type: 'yaml', input: '['},
  {type: 'sbml', input: '<sbml><model></sbml>'},
  {type: 'sbml', input: model('<listOfRules><assignmentRule variable="x"><math><unknown/></math></assignmentRule></listOfRules>')}
];

describe('CLI module input errors', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-module-errors-'));
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: module-errors\n');
  });
  afterEach(() => fs.removeSync(directory));

  cases.forEach(({type, input}, index) => {
    it(`reports ${type} input errors as expected compilation failures (${index})`, () => {
      fs.writeFileSync(path.join(directory, 'model'), input);
      const result = spawnSync(process.execPath, [cli, directory, '--skip-updates',
        '--source=model', `--type=${type}`, '--log-format=json'], {encoding: 'utf8'});
      expect(result.status, result.stdout + result.stderr).to.equal(2);
      expect(result.stdout).not.to.include('Internal "Heta compiler" error');
      const events = fs.readJsonSync(path.join(directory, 'build.log'));
      const diagnostic = events.find((event) => event.level === 'error' && event.opt?.type === 'ModuleError');
      expect(diagnostic.msg).to.include('model');
      expect(diagnostic.opt).to.deep.equal({type: 'ModuleError', filename: 'model'});
      expect(events.some((event) => event.level === 'crit')).to.equal(false);
    });
  });
});
