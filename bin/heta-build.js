#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const { Builder } = require('../src/builder');
const { safeLoad } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _ = require('lodash');
const semver = require('semver');
const { version, bugs } = require('../package');
const colors = require('colors');


let contactMessage = colors.bgRed(`
 +----------------------------------------------------------------+ 
 | Internal Heta-builder error, contact the developers.           | 
 | Create issue: ${bugs.url} | 
 | or mail to: ${bugs.email}                                   | 
 +----------------------------------------------------------------+ 
`);

program
  .description('Compile Heta based platform and create set of export files.')
  //.arguments('<cmd> [dir]')
  .usage('[options] [dir]')
  .option('-d, --declaration <filepath>', 'declaration file name without extension to search throught extensions: ["", ".json", ".json5", ".yml"]', 'platform')
  // options
  .option('-S, --skip-export', 'do not export files to local directory')
  .option('-L, --log-mode <never|error|always>', 'When to create log file.')
  .option('-d, --debug', 'If set the raw module output will be stored in "meta".')
  // moduleImport
  .option('-s, --source <filepath>', 'path to main heta module.')
  .option('-t, --type <heta|xlsx|json|yaml|sbml>', 'type of source file.')
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
  process.stdout.write('Running compilation without declaration file...\n');
  var declaration = {};
} else {
  let declarationFile = searches[extensionNumber];
  process.stdout.write(`Running compilation with declaration file "${declarationFile}"...\n`);
  let declarationText = fs.readFileSync(declarationFile);
  try {
    declaration = safeLoad(declarationText);
  } catch (e) {
    process.stdout.write(`Wrong format of declaration file: \n"${e.message}"\n`);
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

// === combine options CLI => declaration => default index ===
let integralDeclaration = _.defaultsDeep(CLIDeclaration, declaration);

// wrong version throws, if no version stated than skip
let satisfiesVersion = integralDeclaration.builderVersion
  ? semver.satisfies(version, integralDeclaration.builderVersion)
  : true;
if (!satisfiesVersion) {
  process.stdout.write(`Version of declaration file "${integralDeclaration.builderVersion}" does not satisfy current builder.\n`);
  process.exit(1);
}

// === this part uses "send errors to developer" message ===
try {
  var builder = new Builder(integralDeclaration, targetDir);
} catch(e) {
  process.stdout.write(contactMessage + '\n');
  throw e;
}
if (builder.logger.hasErrors) {
  process.stdout.write('Declaration ERROR! See logs.\n');
  process.exit(1);
}

try {
  builder.run();
} catch(e) {
  process.stdout.write(contactMessage + '\n');
  throw e;
}
if (builder.logger.hasErrors) {
  process.stdout.write('Compilation ERROR! See logs.\n');
  if (integralDeclaration.options.exitWithoutError)
    process.exit(0);
  else
    process.exit(1);
} else {
  process.stdout.write('Compilation OK!\n');
  process.exit(0);
}
