#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const fs = require('fs-extra');
const path = require('path');
const { Builder, StdoutTransport } = require('../src');
const YAML = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const { bugs } = require('../package');
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
  .option('-d, --declaration <filepath>', 'declaration file name without extension to search throught extensions: ["", ".json", ".yml"]')
  // options
  .option('--units-check', 'Check all Records for unit consistency.')
  .option('-L, --log-mode <never|error|always>', 'When to create log file.')
  .option('--debug', 'If set the raw module output will be stored in "meta".')
  .option('--dist-dir <filepath>', 'Set export directory path, where to store exported files.')
  .option('--meta-dir <filepath>', 'Set meta directory path.')
  // moduleImport
  .option('-s, --source <filepath>', 'path to main heta module.')
  .option('-t, --type <heta|table|xlsx|json|yaml|sbml>', 'type of source file.')
  .option('-e, --export <formats>', 'export formats: "JSON,XLSX" or "{format:JSON},{format:XLSX,omitRows:3}"')
  // checking newer version of heta-compiler
  .option('--skip-updates', 'Skip checking newer version of heta-compiler.')
  .parse(process.argv);

async function main() {
  let args = program.args;
  let opts = program.opts();
  // print newer version message
  //if (!opts.skipUpdates) await printVersionMessage();

  // set target directory of platform and check if exist
  let targetDir = path.normalize(args[0] || '.');
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) { // check if it does not exist or not a directory
    process.stdout.write(`Target directory "${targetDir}" does not exist.\nSTOP!`);
    process.exit(2); // BRAKE
  }

  // === read declaration file ===
  // search
  let searches = ['', '.json', '.yml']
    .map((ext) => path.join(targetDir, (opts.declaration || 'platform') + ext));
  let extensionNumber = searches
    .map((x) => fs.existsSync(x) && fs.statSync(x).isFile() ) // check if it exist and is file
    .indexOf(true);
  // is declaration file found ?
  let declaration = {options: {}, importModule: {}, export: []}; // default declaration
  if (!opts.declaration && extensionNumber === -1) {
    process.stdout.write('No declaration file, running with defaults...\n');
  } else if (extensionNumber === -1) {
    process.stdout.write(`Declaration file "${opts.declaration}" not found.\nSTOP!`);
    process.exit(2); // BRAKE
  } else {
    let declarationFile = searches[extensionNumber];
    process.stdout.write(`Running compilation with declaration file "${path.resolve(declarationFile)}"...\n`);
    let declarationText = fs.readFileSync(declarationFile);
    try {
      let declarationFromFile = YAML.load(declarationText);
      if (typeof declarationFromFile !== 'object'){
        throw new Error('Not an object.');
      }
      Object.assign(declaration, declarationFromFile);
    } catch (e) {
      process.stdout.write(`Wrong format of declaration file: \n"${e.message}"\n`);
      process.exit(2); // BRAKE
    }
  }

  // parse export
  let exportYAML = '[' + opts.export?.replace(/:/g, ': ') + ']';
  try {
    var exportItems = YAML.load(exportYAML).map((x) => {
      if (typeof x === 'string') {
        return { format: x };
      } else {
        return x;
      }
    }); 
  } catch (e) {
    process.stdout.write(`Wrong format of export option: "${exportYAML}"\n`);
    process.exit(2); // BRAKE
  }

  // === update declaration ===
  opts.unitsCheck !== undefined && (declaration.options.unitsCheck = opts.unitsCheck);
  opts.logMode !== undefined && (declaration.options.logMode = opts.logMode);
  opts.debug !== undefined && (declaration.options.debug = opts.debug);
  opts.distDir !== undefined && (declaration.options.distDir = opts.distDir);
  opts.metaDir !== undefined && (declaration.options.metaDir = opts.metaDir);
  opts.source !== undefined && (declaration.importModule.source = opts.source);
  opts.type !== undefined && (declaration.importModule.type = opts.type);
  opts.export !== undefined && (declaration.export = exportItems);

  let minLogLevel = declaration?.options?.logLevel || 'info'; // set logLevel before declaration check

  let builder = new Builder(
    declaration,
    targetDir,
    fs.readFileSync,
    fs.outputFileSync,
    [new StdoutTransport(minLogLevel)]
  ).run();

  return builder;
}

// simulatanious run
Promise.all([
  main(),
  !program.opts().skipUpdates && printVersionMessage()
]).then(([builder]) => {
  if (builder.container.hetaErrors().length > 0) {
    process.stdout.write('Compilation ERROR! See logs.\n');
    process.exit(2);
  } else {
    process.stdout.write('Compilation OK!\n');
    process.exit(0);
  }
}).catch((error) => {
  if (error.name === 'HetaLevelError') {
    process.stdout.write('Error: ' + error.message + '\nSTOP!\n');
    process.exit(2);
  } else {
    process.stdout.write(contactMessage + '\n');
    process.stdout.write(error.stack);
    process.exit(1); // unexpected error
  }
});
