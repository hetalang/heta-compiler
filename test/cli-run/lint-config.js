/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { Builder } = require('../../src/builder');
const { validateLinterConfig } = require('../../src/linter/validate-config');
const HetaLevelError = require('../../src/heta-level-error');

const cli = path.resolve(__dirname, '../../bin/heta-build.js');
const validConfig = `id: example-audit
preflightChecks:
  builderVersion: "^0.12.3"
  missingChecks: error
  unknownChecks: warn
automaticChecks:
  A002:
    description: Check selected platform fields
    severity: info
    options:
      paths: [id, version]
  A021:
    description: Check selected component fields
    severity: info
    options:
      Const: [title, aux.doi]
manualChecks: {}
`;

describe('CLI lint configuration', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'heta-lint-config-'));
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\n');
    fs.writeFileSync(path.join(directory, 'index.heta'), 'k @Const = 1;');
  });
  afterEach(() => fs.removeSync(directory));

  function run(...args) {
    return spawnSync(process.execPath, [cli, directory, '--skip-updates', '--log-format=json', ...args], {encoding: 'utf8'});
  }

  it('reads the exact relative or absolute YAML file and leaves normal builds working', () => {
    const file = path.join(directory, 'custom.yml');
    fs.writeFileSync(file, validConfig);
    for (const args of [[], ['--linter-config=custom.yml'], [`--linter-config=${file}`]]) {
      const result = run(...args);
      expect(result.status, result.stdout + result.stderr).to.equal(0);
      if (args.length) {
        expect(result.stdout).to.include('Reading linter configuration file');
        expect(result.stdout).to.include('[A002]').and.to.include('[A021]');
      } else {
        expect(result.stdout).not.to.include('[A002]').and.not.to.include('[A021]');
      }
    }
    const config = {id: 'example-audit', preflightChecks: {builderVersion: '^0.12.3', missingChecks: 'error', unknownChecks: 'warn'}, automaticChecks: {A002: {description: 'Selected fields', severity: 'info', options: {paths: ['id']}}}, manualChecks: {}};
    const builder = new Builder({});
    expect(builder.lint(config)).to.equal(builder);
    expect(builder.container.defaultLogs.some((event) => event.opt?.auditCode === 'A002')).to.equal(true);
  });

  it('runs the audit from the platform declaration and supports absolute paths', () => {
    const file = path.join(directory, 'custom.yml');
    fs.writeFileSync(file, validConfig);
    for (const configPath of ['custom.yml', file]) {
      fs.writeFileSync(path.join(directory, 'platform.yml'), JSON.stringify({id: 'example', linterConfig: configPath}));
      const result = run();
      expect(result.status, result.stdout + result.stderr).to.equal(0);
      expect(result.stdout).to.include('Reading linter configuration file').and.to.include('[A002]').and.to.include('[A021]');
    }
  });

  it('lets the CLI override the platform audit configuration', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\nlinterConfig: missing.yml\n');
    fs.writeFileSync(path.join(directory, 'custom.yml'), validConfig);
    const result = run('--linter-config=custom.yml');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    expect(result.stdout).to.include('Reading linter configuration file "custom.yml"').and.to.include('[A002]');
    expect(result.stdout).not.to.include('Cannot read linter configuration');
  });

  it('reports missing or invalid platform audit configuration', () => {
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\nlinterConfig: missing.yml\n');
    const missing = run();
    expect(missing.status, missing.stdout + missing.stderr).to.equal(2);
    expect(missing.stdout).to.include('Cannot read linter configuration file "missing.yml"');
    fs.writeFileSync(path.join(directory, 'platform.yml'), 'id: example\nlinterConfig: 42\n');
    const invalid = run();
    expect(invalid.status, invalid.stdout + invalid.stderr).to.equal(2);
    const events = fs.readJsonSync(path.join(directory, 'build.log'));
    expect(events.some((event) => event.opt?.diagnosticCode === 'PLATFORM_DECLARATION_INVALID_PROPERTY_TYPE' && event.opt.path === '/linterConfig')).to.equal(true);
  });

  it('reports missing files and invalid YAML after building and saves the error', () => {
    for (const [file, content, message] of [
      ['missing.yml', null, 'Cannot read linter configuration file'],
      ['bad.yml', 'id: [', 'Wrong format of linter configuration file']
    ]) {
      if (content !== null) fs.writeFileSync(path.join(directory, file), content);
      const result = run(`--linter-config=${file}`);
      expect(result.status, result.stdout + result.stderr).to.equal(2);
      expect(result.stdout).to.include(message).and.to.include(file);
      expect(result.stdout).to.include('Start exporting to files');
      expect(result.stdout.indexOf('Start exporting to files')).to.be.lessThan(result.stdout.indexOf(message));
      expect(fs.readJsonSync(path.join(directory, 'build.log')).at(-1).msg).to.include(message);
    }
  });

  it('reports schema errors after building and does not run audits', () => {
    fs.writeFileSync(path.join(directory, 'invalid.yml'), validConfig + 'extraOption: true\n');
    const result = run('--linter-config=invalid.yml');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('unknown property "extraOption"');
    expect(result.stdout).to.include('Start exporting to files');
    expect(result.stdout).not.to.include('[A002]');
    expect(result.stdout.indexOf('Start exporting to files')).to.be.lessThan(result.stdout.indexOf('Invalid linter configuration'));
    const event = fs.readJsonSync(path.join(directory, 'build.log')).find((item) => item.opt?.checkId === 'linter-config-valid' && item.level === 'error');
    expect(event.opt.checkId).to.equal('linter-config-valid');
    expect(event.opt.diagnosticCode).to.equal('LINTER_CONFIG_UNKNOWN_PROPERTY');
    expect(event.opt.params.additionalProperty).to.equal('extraOption');
  });

  it('rejects an empty configuration after building', () => {
    fs.writeFileSync(path.join(directory, 'empty.yml'), '');
    const result = run('--linter-config=empty.yml');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('Invalid linter configuration');
    expect(result.stdout).to.include('Start exporting to files');
  });

  it('checks the schema when Builder.lint is invoked directly', () => {
    const builder = new Builder({});
    expect(builder.logger.hasErrors).to.equal(false);
    builder.lint({id: 'incomplete'});
    const errors = builder.container.defaultLogs.filter((event) => event.opt?.checkId === 'linter-config-valid');
    expect(errors.every((event) => event.level === 'error' && event.opt.diagnosticCode === 'LINTER_CONFIG_MISSING_PROPERTY')).to.equal(true);
    expect(errors.map((event) => event.opt.params.missingProperty))
      .to.include.members(['preflightChecks', 'automaticChecks', 'manualChecks']);
    expect(builder.container.defaultLogs.some((event) => event.opt?.auditCode === 'A002')).to.equal(false);
  });

  it('classifies each schema violation in its own diagnostic event', () => {
    const config = {
      id: 42,
      preflightChecks: {builderVersion: '*', missingChecks: 'invalid', unknownChecks: 'warn'},
      automaticChecks: {}, manualChecks: {}, extraOption: true
    };
    const builder = new Builder({}).lint(config);
    const errors = builder.container.defaultLogs.filter((event) => event.opt?.checkId === 'linter-config-valid');
    expect(errors.map((event) => event.opt.diagnosticCode)).to.include.members([
      'LINTER_CONFIG_UNKNOWN_PROPERTY', 'LINTER_CONFIG_INVALID_PROPERTY_TYPE', 'LINTER_CONFIG_INVALID_VALUE'
    ]);
    expect(errors.find((event) => event.opt.keyword === 'enum').opt.path).to.equal('/preflightChecks/missingChecks');
    expect(errors.every((event) => event.opt.params && event.opt.keyword)).to.equal(true);
  });

  it('uses configured fields, classes and descriptions in audit events', () => {
    fs.writeFileSync(path.join(directory, 'custom.yml'), validConfig);
    const result = run('--linter-config=custom.yml', '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(0);
    const events = fs.readJsonSync(path.join(directory, 'build.log'));
    const a002 = events.find((event) => event.opt?.auditCode === 'A002');
    const a021 = events.find((event) => event.opt?.auditCode === 'A021');
    expect(a002.msg).to.include('Check selected platform fields');
    expect(a002.opt.list).to.deep.equal(['version']);
    expect(a021.msg).to.include('Check selected component fields');
    const constants = a021.opt.list.find((item) => item.space === 'nameless').Const;
    expect(constants).to.deep.equal({title: ['k'], 'aux.doi': ['k']});
  });

  it('checks nested paths in platform metadata', () => {
    const config = {
      id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'},
      automaticChecks: {A002: {description: 'Paths', severity: 'info', options: {paths: ['repository.url', 'repository.missing', 'options.absent.value', 'contributors[0]']}}},
      manualChecks: {}
    };
    const builder = new Builder({repository: {url: 'https://example.org'}, contributors: ['author']}).lint(config);
    const event = builder.container.defaultLogs.find((item) => item.opt?.auditCode === 'A002');
    expect(event.opt.list).to.deep.equal(['repository.missing', 'options.absent.value']);
  });

  it('applies severity only to failed audit results', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}};
    for (const [severity, level] of [['info', 'info'], ['warn', 'warn'], ['error', 'error']]) {
      for (const id of ['A002', 'A021']) {
        const builder = new Builder({id: 'example'});
        builder.container.load({id: 'k', class: 'Const'});
        const options = id === 'A002' ? {paths: ['version']} : {Const: ['title']};
        builder.lint({...base, automaticChecks: {[id]: {description: 'test', severity, options}}});
        const event = builder.container.defaultLogs.find((item) => item.opt?.auditCode === id);
        expect(event?.level, `${id} ${severity}`).to.equal(level);
        if (event) expect(event.opt.status).to.equal('fail');
        expect(builder.logger.hasErrors).to.equal(severity === 'error');

        const passed = new Builder({id: 'example'});
        const passedOptions = id === 'A002' ? {paths: ['id']} : {TimeSwitcher: ['title']};
        passed.lint({...base, automaticChecks: {[id]: {description: 'test', severity, options: passedOptions}}});
        const passEvent = passed.container.defaultLogs.find((item) => item.opt?.auditCode === id);
        expect(passEvent.level, `${id} ${severity} pass`).to.equal('info');
        expect(passEvent.opt.status).to.equal('pass');
      }
    }
  });

  it('does not run ignored checks, including option validation', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}};
    const builder = new Builder({id: 'example'}).lint({...base, automaticChecks: {
      A002: {severity: 'ignore', options: {}},
      A021: {severity: 'ignore', options: {UnknownClass: ['title']}}
    }});
    expect(builder.logger.hasErrors).to.equal(false);
    expect(builder.container.defaultLogs.some((event) => ['A002', 'A021'].includes(event.opt?.auditCode))).to.equal(false);
    const passed = new Builder({id: 'example'}).lint({...base, automaticChecks: {
      A002: {severity: 'ignore', options: {paths: ['id']}},
      A021: {severity: 'ignore', options: {TimeSwitcher: ['title']}}
    }});
    expect(passed.container.defaultLogs.some((event) => ['A002', 'A021'].includes(event.opt?.auditCode))).to.equal(false);
  });

  it('includes audit errors in the command result', () => {
    const config = validConfig.replace('description: Check selected platform fields\n    severity: info', 'description: Check selected platform fields\n    severity: error');
    fs.writeFileSync(path.join(directory, 'custom.yml'), config);
    const result = run('--linter-config=custom.yml', '--log-mode=always');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('Compilation finished with SUCCESS!');
    expect(result.stdout).to.include('Audit finished with ERRORS!');
    const event = fs.readJsonSync(path.join(directory, 'build.log')).find((item) => item.opt?.auditCode === 'A002');
    expect(event.level).to.equal('error');
    expect(event.opt.status).to.equal('fail');
    const filtered = run('--linter-config=custom.yml', '--log-level=crit', '--log-mode=always');
    expect(filtered.status, filtered.stdout + filtered.stderr).to.equal(2);
  });

  it('rejects unknown A021 classes as invalid check options', () => {
    const config = validConfig.replace('Const: [title, aux.doi]', 'TypoClass: [title]');
    fs.writeFileSync(path.join(directory, 'custom.yml'), config);
    const result = run('--linter-config=custom.yml');
    expect(result.status, result.stdout + result.stderr).to.equal(2);
    expect(result.stdout).to.include('Unknown class "TypoClass"');
    const event = fs.readJsonSync(path.join(directory, 'build.log')).find((item) => item.opt?.diagnosticCode === 'LINTER_CHECK_INVALID_OPTIONS');
    expect(event.opt).to.include({auditCode: 'A021', path: 'options.TypoClass', className: 'TypoClass'});
    const builder = new Builder({});
    const invalidConfig = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}, automaticChecks: {A021: {severity: 'info', options: {TypoClass: ['title']}}}};
    expect(() => builder.lint(invalidConfig)).to.throw(HetaLevelError, 'TypoClass');
  });

  it('accepts registered classes even when the model has no instances', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}};
    const builder = new Builder({}).lint({...base, automaticChecks: {A021: {description: 'test', severity: 'info', options: {TimeSwitcher: ['title']}}}});
    const event = builder.container.defaultLogs.find((item) => item.opt?.auditCode === 'A021');
    expect(event.opt.status).to.equal('pass');
  });

  it('reports invalid options for both implemented checks', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}};
    const cases = [
      ['A002', {}, 'options.paths'],
      ['A002', {paths: 'id'}, 'options.paths'],
      ['A002', {paths: ['']}, 'options.paths[0]'],
      ['A002', {paths: ['bad path']}, 'options.paths[0]'],
      ['A002', {paths: ['id'], extra: true}, 'options.extra'],
      ['A021', {Const: 'title'}, 'options.Const'],
      ['A021', {Const: [42]}, 'options.Const[0]'],
      ['A021', {Const: ['a..b']}, 'options.Const[0]'],
      ['A021', {Const: ['bad path']}, 'options.Const[0]']
    ];
    for (const [id, options, path] of cases) {
      const builder = new Builder({});
      let thrown;
      try {
        builder.lint({...base, automaticChecks: {[id]: {description: 'test', severity: 'info', options}}});
      } catch (error) {
        thrown = error;
      }
      expect(thrown, `${id} ${path}`).to.be.instanceOf(HetaLevelError);
      expect(thrown.opt).to.include({diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: id, path});
      expect(thrown.message).to.include(`Invalid options for check ${id}:`).and.not.to.include(`[${id}]`);
      expect(thrown.message).to.include(path);
    }
  });

  it('explains invalid option types and allowed policy values', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'invalid', unknownChecks: 'warn'}, automaticChecks: {}, manualChecks: {}};
    const builder = new Builder({}).lint(base);
    const event = builder.container.defaultLogs.find((item) => item.opt?.keyword === 'enum');
    expect(event.msg).to.include('/preflightChecks/missingChecks').and.to.include('ignore, info, warn, error');
    const validBase = {...base, preflightChecks: {...base.preflightChecks, missingChecks: 'error'}};
    expect(() => new Builder({}).lint({...validBase, automaticChecks: {A002: {severity: 'info', options: {paths: 'id'}}}}))
      .to.throw(HetaLevelError, 'must be array; got string');
  });

  it('does not run absent checks and checks only the type of options', () => {
    const base = {id: 'test', preflightChecks: {builderVersion: '*', missingChecks: 'error', unknownChecks: 'warn'}, manualChecks: {}};
    const builder = new Builder({}).lint({...base, automaticChecks: {}});
    expect(builder.container.defaultLogs.some((event) => event.opt?.auditCode)).to.equal(false);
    expect(validateLinterConfig({...base, automaticChecks: {A021: {severity: 'info', options: {Const: 'title', custom: 42}}}})).to.deep.equal([]);
    const invalid = validateLinterConfig({...base, automaticChecks: {A021: {severity: 'info', options: 'invalid'}}});
    expect(invalid.some((error) => error.diagnosticCode === 'LINTER_CONFIG_INVALID_PROPERTY_TYPE' && error.path === '/automaticChecks/A021/options')).to.equal(true);
    const missingOptions = new Builder({}).lint({...base, automaticChecks: {A003: {description: 'test', severity: 'info'}}});
    expect(missingOptions.container.defaultLogs.some((event) =>
      event.opt?.diagnosticCode === 'LINTER_CONFIG_MISSING_PROPERTY' &&
      event.opt.path === '/automaticChecks/A003' && event.opt.params.missingProperty === 'options'
    )).to.equal(true);
    const missingSeverity = new Builder({}).lint({...base, automaticChecks: {A002: {options: {paths: ['id']}}}});
    expect(missingSeverity.container.defaultLogs.some((event) =>
      event.opt?.diagnosticCode === 'LINTER_CONFIG_MISSING_PROPERTY' &&
      event.opt.path === '/automaticChecks/A002' && event.opt.params.missingProperty === 'severity'
    )).to.equal(true);
  });

});
