#!/usr/bin/env node
'use strict';

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

if(index!==-1){
  try{
    let declarationText = fs.readFileSync(searches[index]);
    let declaration = safeLoad(declarationText);
    var builder = new Builder(declaration, targetDir);
  }catch(err){
    console.log('CRIRICAL ERROR!', err.message); // builder initialization error
    process.exit(1);
  }
  builder.runAsync()
    .then(() => {
      console.log('OK! ALL DONE.');
      process.exit(0);
    })
    .catch((err) => {
      console.log('ERROR!', err.message);
      process.exit(1);
    });
}else{
  console.log( // builder initialization error(no builder file)
    'STOP! Declaration file is not found in\n',
    JSON.stringify(searches, null, 2)
  );
  process.exit(1);
}
