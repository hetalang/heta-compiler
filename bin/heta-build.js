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
const { printVersionMessage } = require('./print-version-message');

let contactMessage = colors.bgRed(`
 +----------------------------------------------------------------+ 
 | Internal "Heta compiler" error, contact the developers.        | 
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
  .option('--units-check', 'Check all Records for unit consistency.')
  .option('-S, --skip-export', 'do not export files to local directory')
  .option('-L, --log-mode <never|error|always>', 'When to create log file.')
  .option('-d, --debug', 'If set the raw module output will be stored in "meta".')
  .option('--ss-only', 'Run in SimSolver supporting mode: skip declared exports, add default export to SimSolver.')
  .option('--dist-dir <filepath>', 'Set export directory path, where to store distributives.')
  .option('--meta-dir <filepath>', 'Set meta directory path.')
  // moduleImport
  .option('-s, --source <filepath>', 'path to main heta module.')
  .option('-t, --type <heta|xlsx|json|yaml|sbml>', 'type of source file.')
  .parse(process.argv);

(async () => {
  // print newer version message
  await printVersionMessage();

  // set target directory of platform and check if exist
  let targetDir = path.resolve(program.args[0] || '.');
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) { // check if it does not exist or not a dicrectory
    process.stdout.write(`Target directory "${targetDir}" does not exist.\nSTOP!`);
    process.exit(1);
  }
  // set base name of declaration file
  let platformFile = program.declaration;

  // === read declaration file ===
  // search
  let searches = ['', '.json', '.json5', '.yml']
    .map((ext) => path.join(targetDir, platformFile + ext));
  let extensionNumber = searches
    .map((x) => fs.existsSync(x) && fs.statSync(x).isFile() ) // check if it exist and is file
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
      unitsCheck: program.unitsCheck,
      skipExport: program.skipExport,
      logMode: program.logMode,
      debug: program.debug,
      ssOnly: program.ssOnly,
      distDir: program.distDir,
      metaDir: program.metaDir
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
  if (builder.container.hetaErrors().length > 0) {
    process.stdout.write('Declaration ERROR! See logs.\n');
    process.exit(1);
  }

  try {
    builder.run();
  } catch(e) {
    process.stdout.write(contactMessage + '\n');
    throw e;
  }
  if (builder.container.hetaErrors().length > 0) {
    process.stdout.write('Compilation ERROR! See logs.\n');
    if (integralDeclaration.options.exitWithoutError)
      process.exit(0);
    else
      process.exit(1);
  } else {
    process.stdout.write('Compilation OK!\n');
    process.exit(0);
  }

})();
