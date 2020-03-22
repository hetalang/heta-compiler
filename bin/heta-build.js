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
  .option('-d, --declaration <filename>', 'platform declaration file, search extensions: ["", ".json", ".json5", ".yml"]', 'platform')
  .option('--skip-export', 'do not export files to local directory')
  .option('--log-mode <never|error|always>', 'When to create log file.', 'never')
  .parse(process.argv);

// set target directory of platform
let targetDir = path.resolve(program.args[0] || '.');

// === read declaration file ===
// search
let searches = ['', '.json', '.json5', '.yml']
  .map((x) => path.join(targetDir, program.declaration + x));
let extensionNumber = searches
  .map((x) => fs.existsSync(x))
  .indexOf(true);
// "no builder file" error
if (extensionNumber === -1) {
  console.log( 
    'STOP! Declaration file is not found in paths:\n',
    JSON.stringify(searches, null, 2)
  );
  process.exit(1);
}
let declarationText = fs.readFileSync(searches[extensionNumber]);
try {
  var declaration = safeLoad(declarationText);
} catch (e) {
  console.log('Wrong format of declaration file:', e.message);
  process.exit(1);
}

// === options from CLI ===
let options = {
  skipExport: program.skipExport,
  logMode: program.logMode
};

// === combine options ===
let integralDeclaration = _.defaultsDeep(
  { options: options },
  declaration
);

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
  options.exitWithoutError ? process.exit(0) : process.exit(1);
} else {
  console.log('Compilation OK!');
  process.exit(0);
}
