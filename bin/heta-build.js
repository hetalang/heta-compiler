#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const { Builder } = require('../src');
const { safeLoad } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _ = require('lodash');
const semver = require('semver');
const { version } = require('../package');

program
  .description('Compile Heta based platform and create set of export files.')
  //.arguments('<cmd> [dir]')
  .usage('[options] [dir]')
  .option('-d, --declaration <filepath>', 'platform declaration file without extension, search extensions: ["", ".json", ".json5", ".yml"]', 'platform')
  // options
  .option('--skip-export', 'do not export files to local directory')
  .option('--log-mode <never|error|always>', 'When to create log file.')
  .option('--debug', 'If set the raw module output will be stored in "meta".')
  // moduleImport
  .option('--source <filepath>', 'path to main heta module.')
  .option('--type <heta|xlsx|json|yaml|sbml>', 'type of source file.')
  .parse(process.argv);

// set target directory of platform
let targetDir = path.resolve(program.args[0] || '.');
// set base name of declaration file
let platformFile = program.declaration;

// === read declaration file ===
// search
let searches = ['', '.json', '.json5', '.yml']
  .map((ext) => path.join(targetDir, platformFile + ext));
let extensionNumber = searches
  .map((x) => fs.existsSync(x))
  .indexOf(true);
// is declaration file found ?
if (extensionNumber === -1) {
  var declaration = {};
  //console.log( 'Declaration file is not found in paths:\n', JSON.stringify(searches, null, 2));
  console.log('Running compilation without declaration file.');
} else {
  let delarationFile = searches[extensionNumber];
  console.log(`Running compilation with declaration "${delarationFile}"`);
  let declarationText = fs.readFileSync(delarationFile);
  try {
    declaration = safeLoad(declarationText);
  } catch (e) {
    console.log('Wrong format of declaration file:', e.message);
    process.exit(1);
  }
}

// === options from CLI ===
let CLIDeclaration = {
  options: {
    skipExport: program.skipExport,
    logMode: program.logMode,
    debug: program.debug
  },
  importModule: {
    source: program.source,
    type: program.type
  }
};

// === combine options ===
let integralDeclaration = _.defaultsDeep(CLIDeclaration, declaration);

// wrong version throws, if no version stated than skip
let satisfiesVersion = integralDeclaration.builderVersion
  ? semver.satisfies(version, integralDeclaration.builderVersion)
  : true;
if (!satisfiesVersion) {
  console.log(`Version of declaration file "${integralDeclaration.builderVersion}" does not satisfy current builder.`);
  process.exit(1);
}

// === runBuilder ===
let builder = new Builder(integralDeclaration, targetDir);
if (builder.logger.hasErrors) {
  console.log('Declaration ERROR! See logs.');
  process.exit(1);
}

builder.run();
if (builder.logger.hasErrors) {
  console.log('Compilation ERROR! See logs.');
  integralDeclaration.options.exitWithoutError 
    ? process.exit(0) 
    : process.exit(1);
} else {
  console.log('Compilation OK!');
  process.exit(0);
}
