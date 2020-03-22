#!/usr/bin/env node
'use strict';

const program = require('commander');
const pkg = require('../package');

let version = pkg.version;
let descriptionText = `Command line utilities for working with Heta compiler
  version: ${version}
  author: ${pkg.author}
  license: ${pkg.license}`;

program
  .version(version, '-v, --version')
  .description(descriptionText)
  .command('build [dir]', 'Compile Heta based platform and create set of export files.')
  .command('init [dir]', 'Create template platform files in directory')
  .parse(process.argv);
