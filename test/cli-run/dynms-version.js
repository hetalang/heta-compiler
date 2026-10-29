/* global describe, it */
const { execFileSync } = require('child_process');
const path = require('path');
const { expect } = require('chai');
const dynmsVersion = require('../../src/dynms/dynms.schema.json').properties.dynms.const;
const compilerVersion = require('../../package.json').version;

const cli = path.resolve(__dirname, '../../bin/heta.js');
const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' }).trim();

describe('CLI version options', () => {
  it('reports the bundled DynMS schema version without building a model', () => {
    expect(run('--dynms-version')).to.equal(dynmsVersion);
    expect(run('--version')).to.equal(compilerVersion);
  });

  it('shows the DynMS version and option in both help forms', () => {
    for (const help of [run('help'), run('--help')]) {
      expect(help).to.include(`DynMS version: ${dynmsVersion}`);
      expect(help).to.include('--dynms-version');
    }
  });
});
