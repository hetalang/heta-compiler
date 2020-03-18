#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const { Builder } = require('../src');
const { safeLoad } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

program
  .description('Import all files, send to database and export to local files')
  //.arguments('<cmd> [dir]')
  .usage('[options] [dir]')
  .option('--no-export', 'do not export files to local directory')
  .option('--no-import', 'do not import files, just export from database')
  .option('-i, --index-file <filename>', 'platform index file, search through extensions: ["", ".json", ".json5", ".yml"]', 'platform')
  .parse(process.argv);

let targetDir = path.resolve(program.args[0] || '.');

// search index file
let searches = ['', '.json', '.json5', '.yml']
  .map((x) => path.join(targetDir, program.indexFile + x));

let index = searches
  .map((x) => fs.existsSync(x))
  .indexOf(true);

if (index!==-1) {
  let declarationText = fs.readFileSync(searches[index]);
  let declaration = safeLoad(declarationText);
  var builder = new Builder(declaration, targetDir);

  builder.runAsync().then(() => {
    if (builder.logger.hasErrors) {
      console.log('Compilation ERROR! See logs.');
      process.exit(1);
    } else {
      console.log('Compilation OK!');
      process.exit(0);
    }
  }, (err) => {
    console.log(err); // JS error
    process.exit(1);
  });
} else {
  console.log( // builder initialization error(no builder file)
    'STOP! Declaration file is not found in\n',
    JSON.stringify(searches, null, 2)
  );
  process.exit(1);
}
