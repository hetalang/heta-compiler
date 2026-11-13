/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/heta-build.js');

describe('CLI logging', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-logging-'));
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: logging-test\n');
    fs.writeFileSync(path.join(directory, 'index.heta'), 'k @Const = 1;');
  });
  afterEach(() => fs.removeSync(directory));

  const run = (directory, ...args) => spawnSync(process.execPath,
    [cli, directory, '--skip-updates', ...args], { encoding: 'utf8' });
  const log = (directory) => fs.readFileSync(path.join(directory, 'build.log'), 'utf8');

  it('logs declaration reading and successful completion to both transports', () => {
    const result = run(directory, '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    for (const output of [result.stdout, log(directory)]) {
      expect(output).to.include('Reading declaration file "platform.yml"');
      expect(output).to.include('Compilation OK!');
      expect(output).to.include('[info]');
    }
  });

  it('saves structured JSON while keeping console output textual', () => {
    const result = run(directory, '--log-format=json', '--log-mode=always', '--log-path=build.json');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    const events = fs.readJsonSync(path.join(directory, 'build.json'));
    expect(events).to.be.an('array').that.is.not.empty;
    expect(events[0]).to.deep.equal({
      level: 'info', msg: 'Reading declaration file "platform.yml"...',
      opt: { type: 'CliInfo' }, levelNum: 1
    });
    expect(events.at(-1).msg).to.equal('Compilation OK!');
    expect(JSON.stringify(events)).not.to.include(directory);
    expect(result.stdout).to.include('[info]');
    expect(result.stdout).to.include('Compilation OK!');
    expect(fs.existsSync(path.join(directory, 'build.log'))).to.equal(false);
  });

  it('saves an empty JSON array when all events are filtered out', () => {
    const result = run(directory, '--log-format=json', '--log-mode=always', '--log-level=error');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    expect(JSON.parse(log(directory))).to.deep.equal([]);
  });

  it('saves JSON errors and metadata when Builder cannot be created', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'notes: 1.1\n');
    const result = run(directory, '--log-format=json', '--log-level=error');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    const events = JSON.parse(log(directory));
    expect(events.every((event) => event.level === 'error' && event.levelNum === 3)).to.equal(true);
    expect(events.some((event) => event.opt.type === 'BuilderError' && event.opt.params)).to.equal(true);
    expect(events.at(-1).opt.type).to.equal('CliError');
  });

  it('applies log-mode to JSON files', () => {
    expect(run(directory, '--log-format=json').status).to.equal(0);
    expect(fs.existsSync(path.join(directory, 'build.log'))).to.equal(false);
    const result = run(directory, '--log-format=json', '--declaration=missing', '--log-mode=never');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(fs.existsSync(path.join(directory, 'build.log'))).to.equal(false);
  });

  it('rejects unsupported formats before touching existing logs', () => {
    const logPath = path.join(directory, 'build.log');
    fs.writeFileSync(logPath, 'preserve');
    const result = run(directory, '--log-format=yaml');
    expect(result.status).not.to.equal(0);
    expect(result.stderr).to.include('--log-format');
    expect(fs.readFileSync(logPath, 'utf8')).to.equal('preserve');
  });

  it('supports explicit text format', () => {
    const result = run(directory, '--log-format=text', '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    expect(log(directory)).to.match(/^\[info\]\tReading declaration file/);
    expect(log(directory)).to.match(/\[info\]\tCompilation OK!\n$/);
  });

  it('prints the absolute project directory only to the console', () => {
    const result = run(directory, '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    expect(result.stdout).to.include(`Running compilation in directory "${directory}"`);
    expect(log(directory)).not.to.include('Running compilation in directory');
    expect(log(directory)).not.to.include(directory);
  });

  it('filters CLI progress and successful completion in console and file', () => {
    const result = run(directory, '--log-mode=always', '--log-level=error');
    expect(result.status, result.stderr).to.equal(0);
    expect(result.stdout).to.equal(`Running compilation in directory "${directory}"...\n`);
    expect(log(directory)).to.equal('');
  });

  it('flushes errors before Builder exists and preserves the failure exit code', () => {
    const result = run(directory, '--declaration=missing', '--log-level=error');
    expect(result.status, result.stderr).to.equal(2);
    for (const output of [result.stdout, log(directory)]) {
      expect(output).to.include('Declaration file "missing" not found.');
      expect(output).to.include('[error]');
    }
    expect(log(directory)).not.to.include('Running compilation');
  });

  it('flushes malformed declaration errors before exiting', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: [');
    const result = run(directory, '--log-level=error');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('Wrong format of declaration file:');
    expect(log(directory)).to.include('Wrong format of declaration file:');
  });

  it('flushes malformed export option errors before exiting', () => {
    const result = run(directory, '--export=[', '--log-level=error');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('Wrong format of export option:');
    expect(log(directory)).to.include('Wrong format of export option:');
  });

  it('logs constructor failures using the same transports', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'notes: 1.1\n');
    const result = run(directory, '--log-level=error');
    expect(result.status, result.stderr).to.equal(2);
    for (const output of [result.stdout, log(directory)]) {
      expect(output).to.include('Wrong structure of platform file.');
      expect(output).to.include('[error]');
    }
  });

  it('retains log-mode behavior for success and early failures', () => {
    expect(run(directory).status).to.equal(0);
    expect(fs.existsSync(path.join(directory, 'build.log'))).to.equal(false);
    expect(run(directory, '--declaration=missing', '--log-mode=never').status).to.equal(2);
    expect(fs.existsSync(path.join(directory, 'build.log'))).to.equal(false);
  });

  it('removes stale logs even when saving is skipped', () => {
    const logPath = path.join(directory, 'build.log');
    for (const args of [[], ['--log-mode=never'], ['--declaration=missing', '--log-mode=never']]) {
      fs.writeFileSync(logPath, 'previous log');
      const result = run(directory, ...args);
      expect(result.status, result.stdout + result.stderr).to.equal(args.includes('--declaration=missing') ? 2 : 0);
      expect(fs.existsSync(logPath)).to.equal(false);
    }
  });

  it('only removes the configured log path relative to the project or absolute', () => {
    const defaultLog = path.join(directory, 'build.log');
    const customLog = path.join(directory, 'custom.log');
    fs.writeFileSync(defaultLog, 'preserve');
    for (const logPath of ['custom.log', customLog]) {
      fs.writeFileSync(customLog, 'previous custom log');
      const result = run(directory, '--log-path', logPath);
      expect(result.status, result.stdout + result.stderr).to.equal(0);
      expect(fs.existsSync(customLog)).to.equal(false);
      expect(fs.readFileSync(defaultLog, 'utf8')).to.equal('preserve');
    }
  });

  it('does not remove directories when saving is skipped', () => {
    for (const args of [[], ['--log-mode=never'], ['--log-mode=never', '--declaration=missing']]) {
      const result = run(directory, '--log-path', directory, ...args);
      expect(result.status, result.stdout + result.stderr).to.equal(args.includes('--declaration=missing') ? 2 : 0);
      expect(result.stderr).to.equal('');
    }
  });

  it('overwrites an existing file with the current buffered log', () => {
    fs.writeFileSync(path.join(directory, 'build.log'), 'previous log');
    const result = run(directory, '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    expect(log(directory)).not.to.include('previous log');
    expect(log(directory)).to.match(/^\[info\]\tReading declaration file/);
    expect(log(directory)).to.match(/\[info\]\tCompilation OK!\n$/);
  });

  it('reports save failures to stderr without an unhandled exception', () => {
    const result = run(directory, '--log-mode=always', '--log-path', directory);
    expect(result.status).to.equal(1);
    expect(result.stdout).to.include('Compilation OK!');
    expect(result.stderr).to.include('Cannot save log file');
    expect(result.stderr).not.to.include('UnhandledPromiseRejection');
  });

  it('saves critical errors and their stack traces', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'options: null\n');
    const result = run(directory, '--units-check', '--log-level=crit');
    expect(result.status, result.stdout + result.stderr).to.equal(1);
    expect(result.stdout).to.include('[crit]');
    expect(log(directory)).to.include('[crit]\t');
    expect(log(directory)).to.include('TypeError:');
  });

  it('does not remove unrelated logs when the target directory is missing', () => {
    const logPath = path.join(directory, 'existing.log');
    fs.writeFileSync(logPath, 'preserve');
    const result = run(path.join(directory, 'missing'), '--log-mode=never', '--log-path', logPath);
    expect(result.status, result.stderr).to.equal(2);
    expect(result.stdout).to.include('does not exist');
    expect(fs.readFileSync(logPath, 'utf8')).to.equal('preserve');
  });
});
