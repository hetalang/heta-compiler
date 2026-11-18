/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/heta-build.js');

describe('CLI platform diagnostic codes', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-cli-diagnostics-'));
  });
  afterEach(() => fs.removeSync(directory));

  function run(...args) {
    return spawnSync(process.execPath, [cli, directory, '--skip-updates', '--log-format=json', ...args], {encoding: 'utf8'});
  }
  function errorEvents() {
    return fs.readJsonSync(path.join(directory, 'build.log')).filter((event) => event.level === 'error');
  }

  it('records a missing declaration without a platform diagnostic', () => {
    const result = run('--declaration=missing');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(errorEvents().at(-1).opt).not.to.have.property('diagnosticCode');

    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\n');
    const preload = path.join(directory, 'read-error.js');
    fs.writeFileSync(preload, `
      const fs = require(${JSON.stringify(require.resolve('fs-extra'))});
      const read = fs.readFileSync;
      fs.readFileSync = function(file, ...args) {
        if (file === 'platform.yml') throw Object.assign(new Error('permission denied'), {code: 'EACCES'});
        return read.call(this, file, ...args);
      };
    `);
    const unreadable = spawnSync(process.execPath, ['--require', preload, cli, directory, '--skip-updates', '--log-format=json'], {encoding: 'utf8'});
    expect(unreadable.status, unreadable.stdout + unreadable.stderr).to.equal(2);
    const error = errorEvents().at(-1);
    expect(error.msg).to.include('Cannot read declaration file "platform.yml": permission denied');
    expect(error.opt).not.to.have.property('diagnosticCode');
  });

  it('records malformed declaration syntax and malformed export options separately', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: [');
    expect(run().status).to.equal(2);
    expect(errorEvents().at(-1).opt).not.to.have.property('diagnosticCode');
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\n');
    expect(run('--export=[').status).to.equal(2);
    expect(errorEvents().at(-1).opt).not.to.have.property('diagnosticCode');
  });

  it('rejects a negative table sheet in the platform declaration', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'importModule:\n  type: table\n  source: model.xlsx\n  sheet: -1\n');
    const result = run();
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    const error = errorEvents().find((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_VALUE');
    expect(error.opt).to.include({path: '/importModule/sheet', keyword: 'minimum'});
  });

  it('propagates circular module exception codes to JSON logs', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\n');
    fs.writeFileSync(path.join(directory, 'index.heta'), 'include ./index.heta type heta;');
    const result = run();
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(errorEvents().at(-1).opt).to.include({diagnosticCode: 'CIRCULAR_MODULE_INCLUDES'});
  });

  it('keeps unexpected application errors unclassified', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'options: null\n');
    const result = run('--units-check');
    expect(result.status, result.stdout + result.stderr).to.equal(1);
    const events = fs.readJsonSync(path.join(directory, 'build.log'));
    const critical = events.find((event) => event.level === 'crit');
    expect(critical).not.to.have.property('opt');
  });
});
