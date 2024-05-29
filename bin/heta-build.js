#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const path = require('path');
const { Builder } = require('../src/builder');
const { load } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _merge = require('lodash/merge');
const semver = require('semver');
const { version, bugs } = require('../package');
const colors = require('colors');
const { printVersionMessage } = require('./print-version-message');

let contactMessage = colors.bgRed(`
 +-------------------------------------------------------------------+ 
 | Internal "Heta compiler" error, contact the developers.           | 
 | Create an issue: ${bugs.url} | 
 | or mail to: ${bugs.email}                                      | 
 +-------------------------------------------------------------------+ 
`);

program
  .name('heta build')
  .description('Compile Heta based platform and create set of export files.')
  //.arguments('<cmd> [dir]')
  .usage('[options] [dir]')
  .option('-d, --declaration <filepath>', 'declaration file name without extension to search throught extensions: ["", ".json", ".json5", ".yml"]')
  // options
  .option('--units-check', 'Check all Records for unit consistency.')
  .option('-S, --skip-export', 'do not export files to local directory')
  .option('-L, --log-mode <never|error|always>', 'When to create log file.')
  .option('--debug', 'If set the raw module output will be stored in "meta".')
  .option('--julia-only', 'Run in Julia supporting mode: skip declared exports.')
  .option('--dist-dir <filepath>', 'Set export directory path, where to store exported files.')
  .option('--meta-dir <filepath>', 'Set meta directory path.')
  // moduleImport
  .option('-s, --source <filepath>', 'path to main heta module.')
  .option('-t, --type <heta|table|xlsx|json|yaml|sbml>', 'type of source file.')
  // checking newer version of heta-compiler
  .option('--skip-updates', 'Skip checking newer version of heta-compiler.')
  .parse(process.argv);

(async () => {
  let args = program.args;
  let opts = program.opts();
  // print newer version message
  if (!opts.skipUpdates) await printVersionMessage();

  // set target directory of platform and check if exist
  let targetDir = path.resolve(args[0] || '.');
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) { // check if it does not exist or not a directory
    process.stdout.write(`Target directory "${targetDir}" does not exist.\nSTOP!`);
    process.exit(1); // BRAKE
  }

  // === read declaration file ===
  // search
  let searches = ['', '.json', '.json5', '.yml']
    .map((ext) => path.join(targetDir, (opts.declaration || 'platform') + ext));
  let extensionNumber = searches
    .map((x) => fs.existsSync(x) && fs.statSync(x).isFile() ) // check if it exist and is file
    .indexOf(true);
  // is declaration file found ?
  if (!opts.declaration && extensionNumber === -1) {
    process.stdout.write('No declaration file, running with defaults...\n');
    var declaration = {};
  } else if (extensionNumber === -1) {
    process.stdout.write(`Declaration file "${opts.declaration}" not found.\nSTOP!`);
    process.exit(1); // BRAKE
  } else {
    let declarationFile = searches[extensionNumber];
    process.stdout.write(`Running compilation with declaration file "${declarationFile}"...\n`);
    let declarationText = fs.readFileSync(declarationFile);
    try {
      declaration = load(declarationText);
      if (typeof declaration !== 'object'){
        throw new Error('Not an object.');
      }
    } catch (e) {
      process.stdout.write(`Wrong format of declaration file: \n"${e.message}"\n`);
      process.exit(1); // BRAKE
    }
  }

  // === options from CLI ===
  let CLIDeclaration = {
    options: {
      unitsCheck: opts.unitsCheck,
      skipExport: opts.skipExport,
      logMode: opts.logMode,
      debug: opts.debug,
      juliaOnly: opts.juliaOnly,
      distDir: opts.distDir,
      metaDir: opts.metaDir
    },
    importModule: {
      source: opts.source,
      type: opts.type
    }
  };

  // === update declaration ===
  _merge(declaration, CLIDeclaration);

  // === wrong version throws, if no version stated than skip ===
  let satisfiesVersion = declaration.builderVersion
    ? semver.satisfies(version, declaration.builderVersion)
    : true;
  if (!satisfiesVersion) {
    process.stdout.write(`Version "${declaration.builderVersion}" stated in declaration file is not supported by the builder.\n`);
    process.exit(1); // BRAKE
  }

  // === this part displays "send errors to developer" message ===
  try {
    var builder = new Builder(declaration, targetDir);
    builder.run();
  } catch(error) {
    if (error.name === 'HetaLevelError') {
      process.stdout.write(error.message + '\nSTOP!\n');
      process.exit(3);
    } else {
      process.stdout.write(contactMessage + '\n');
      process.stdout.write(error.stack);
      process.exit(1); // unexpected error
    }
  }
  if (builder.container.hetaErrors().length > 0) {
    process.stdout.write('Compilation ERROR! See logs.\n');
    process.exit(2);
  } else {
    process.stdout.write('Compilation OK!\n');
    process.exit(0);
  }

})();
