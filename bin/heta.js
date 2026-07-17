#!/usr/bin/env node
'use strict';
const { Command } = require('commander');
const { version } = require('../package');

let descriptionText = `Command line utilities for working with Heta compiler
  Version: ${version}
  Node: ${process.version}`;

const subcommands = new Set(['build', 'init']);

function runSubcommand(name, args) {
  // A SEA contains one entry point, so subcommands must run in this process.
  // Keep argv compatible with running heta-build/heta-init directly.
  process.argv = process.argv.slice(0, 2).concat(args);
  if (name === 'build') {
    require('./heta-build');
  } else if (name === 'init') {
    require('./heta-init');
  }
}

const command = process.argv[2];
if (subcommands.has(command)) {
  runSubcommand(command, process.argv.slice(3));
} else if (command === 'help' && subcommands.has(process.argv[3])) {
  runSubcommand(process.argv[3], ['--help']);
} else {
  if (!command || (command === 'help' && process.argv.length === 3)) {
    process.argv[2] = '--help';
  }

  const program = new Command('heta');
  program
    .version(version, '-v, --version')
    .description(descriptionText);
  program
    .command('build [dir]')
    .description('Compile Heta based platform and create set of export files.');
  program
    .command('init [dir]')
    .description('Create template platform files in directory.');
  program.parse(process.argv);
}
