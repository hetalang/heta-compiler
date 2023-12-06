#!/usr/bin/env node
'use strict';
const { Command } = require('commander');
const program = new Command('heta');
const { version } = require('../package');

let descriptionText = `Command line utilities for working with Heta compiler
  Version: ${version}
  Node: ${process.version}`;

program
  .version(version, '-v, --version')
  .description(descriptionText)
  .command('build [dir]', 'Compile Heta based platform and create set of export files.')
  .command('init [dir]', 'Create template platform files in directory.')
  .command('update', 'Update heta-compiler to the latest version.')
  .parse(process.argv);
