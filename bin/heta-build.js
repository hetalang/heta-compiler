#!/usr/bin/env node

// error codes for CLI
// 0 - OK
// 1 - unexpected error
// 2 - error because of wrong input

const { Command } = require('commander');
const program = new Command();
const fs = require('fs-extra');
const path = require('path');
const { Builder, StdoutTransport, Transport } = require('../src');
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
  // options
  .option('--units-check', 'Check all Records for unit consistency.')
  .option('--debug', 'If set the raw module output will be stored in "meta".')
  .option('--dist-dir <filepath>', 'Set export directory path, where to store exported files.')
  .option('--meta-dir <filepath>', 'Set meta directory path.')
  // moduleImport
  .option('-s, --source <filepath>', 'path to main heta module.')
  .option('-t, --type <heta|table|xlsx|json|yaml|sbml>', 'type of source file.')
  .option('-e, --export <formats>', 'export formats: "JSON,XLSX" or "{format:JSON},{format:XLSX,omitRows:3}"')
  // cli level
  .option('-d, --declaration <filepath>', 'declaration file name without extension to search throught extensions: ["", ".json", ".yml"]')
  .option('--skip-updates', 'Skip checking newer version of heta-compiler.') // checking newer version of heta-compiler
  .option('--log-level <debug|info|warn|error|crit>', 'Set log level to display.')
  .option('-L, --log-mode <never|error|always>', 'When to create log file.', 'error')
  .option('--log-path <filepath>', 'Set log file path.', 'build.log')
  //.options('--log-format <json|text>', 'Set log format.', 'text') // not implemented
  .parse(process.argv);

let logStream = null;
function message(message) {
  process.stdout.write(message + '\n');
  logStream?.write(message + '\n');
}

async function main() {
  let args = program.args;   // target directory
  let cliOptions = program.opts(); // cli declaration + name of declaration file + log level

  // set target directory of platform and check if exist
  let targetDir = path.normalize(args[0] || '.');
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) { // check if it does not exist or not a directory
    message(`Target directory "${targetDir}" does not exist.\nSTOP!`);
    process.exit(2); // BRAKE
  }
  
  // init logging to file
  logStream = fs.createWriteStream(cliOptions.logPath, { flags: 'w' }); // or 'a' to append

  message(`Running compilation in directory "${path.resolve(targetDir)}"...\n`); // global path

  // set targetDir as working directory
  process.chdir(targetDir);

  // set minimal log level
  let logLevel = cliOptions.logLevel || 'info';

  // 0. empty declaration
  let declaration = {options: {}, importModule: {}, export: []};

  // 1. declaration from file
  // search
  let searches = ['', '.json', '.yml']
    .map((ext) => (cliOptions.declaration || 'platform') + ext);
  let extensionNumber = searches
    .map((x) => fs.existsSync(x) && fs.statSync(x).isFile() ) // check if it exist and is file
    .indexOf(true);
  // is declaration file found ?
  if (!cliOptions.declaration && extensionNumber === -1) {
    message('No declaration file, running with defaults...\n');
  } else if (extensionNumber === -1) {
    message(`Declaration file "${cliOptions.declaration}" not found.\nSTOP!`);
    process.exit(2); // BRAKE
  } else {
    let declarationFile = searches[extensionNumber];
    message(`Reading declaration file "${declarationFile}"...\n`);
    let declarationText = fs.readFileSync(declarationFile);
    try {
      let declarationFromFile = YAML.load(declarationText);
      if (typeof declarationFromFile !== 'object'){
        throw new Error('Not an object.');
      }
      Object.assign(declaration, declarationFromFile);
    } catch (e) {
      message(`Wrong format of declaration file: \n"${e.message}"\n`);
      process.exit(2); // BRAKE
    }
  }

  // 2. declaration from cli
  // parse export
  try {
    var exportItems = parseExportOption(cliOptions.export);
  } catch (e) {
    message(`Wrong format of export option: "${cliOptions.export}"\n`);
    process.exit(2); // BRAKE
  }

  // update declaration
  cliOptions.unitsCheck !== undefined && (declaration.options.unitsCheck = cliOptions.unitsCheck);
  cliOptions.debug !== undefined && (declaration.options.debug = cliOptions.debug);
  cliOptions.distDir !== undefined && (declaration.options.distDir = cliOptions.distDir);
  cliOptions.metaDir !== undefined && (declaration.options.metaDir = cliOptions.metaDir);
  cliOptions.source !== undefined && (declaration.importModule.source = cliOptions.source);
  cliOptions.type !== undefined && (declaration.importModule.type = cliOptions.type);
  cliOptions.export !== undefined && (declaration.export = exportItems);

  // 3. run builder (set declaration defaults internally)
  let builder = new Builder(
    declaration,
    fs.readFileSync,
    fs.outputFileSync,
    [
      new StdoutTransport(logLevel), // log to stdout
      new FileTransport(logLevel, logStream) // log to file
    ]
  ).run();

  return builder;
}

class FileTransport extends Transport {
  constructor(level, stream) {
    super(level);
    this.stream = stream;
  }
  analyzer(level, msg, opt, levelNum) {
    if (levelNum >= this.showLevelNum) {
      let line = `[${level}]\t${msg}`;
      this.stream?.write(line + '\n');
    }
  }
}

function parseExportOption(value = '') {
  let exportYAML = '[' + value.replace(/:/g, ': ') + ']';
  var exportItems = YAML.load(exportYAML).map((x) => {
    if (typeof x === 'string') {
      return { format: x };
    } else {
      return x;
    }
  });

  return exportItems;
}

// simulatanious run
Promise.all([
  main(),
  !program.opts().skipUpdates && printVersionMessage()
]).then(([builder]) => {
  const { logMode, logPath } = program.opts();
  if (builder.container.hetaErrors().length > 0) {
    process.stdout.write('Compilation ERROR! See logs.\n');
    logStream?.write('Compilation ERROR! See logs.\n');
    logMode !== 'never' && fs.removeSync(logPath);
    process.exit(2);
  } else {
    process.stdout.write('Compilation OK!\n');
    logStream?.write('Compilation OK!\n');
    logMode !== 'always' && fs.removeSync(logPath);
    process.exit(0);
  }
}).catch((error) => {
  const { logMode, logPath } = program.opts();
  if (error.name === 'HetaLevelError') {
    process.stdout.write('Error: ' + error.message + '\nSTOP!\n');
    logStream?.write('Error: ' + error.message + '\nSTOP!\n');
    logMode !== 'never' && fs.removeSync(logPath);
    process.exit(2);
  } else {
    process.stdout.write(contactMessage + '\n');
    process.stdout.write(error.stack);
    logStream?.write(contactMessage + '\n');
    logStream?.write(error.stack);
    logMode !== 'never' && fs.removeSync(logPath);
    process.exit(1); // unexpected error
  }
});
