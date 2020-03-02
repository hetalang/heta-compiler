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
  .command('build [dir]', 'Import all files, send to database and export to local files')
  .command('init [dir]', 'Create template platform files in directory')
  .parse(process.argv);
