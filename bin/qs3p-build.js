#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const Declaration = require('../src/declaration');
const {safeLoad} = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

program
  .description('Import all files, send to database and export to local files')
  //.arguments('<cmd> [dir]')
  .usage('[options] [dir]')
  .option('--no-export', 'do not export files to local directory')
  .option('--no-import', 'do not import files, just export from database')
  .option('-i, --index-file <filename>', 'platform index file, search through extensions: ["", ".json", ".json5", ".yml"]', 'platform')
  .parse(process.argv);


// set environment as 'development', it requires only for winston
// process.env.NODE_ENV = 'development';

let targetDir = path.resolve(program.args[0] || '.');
// console.log(targetDir);

// search index file
let searches = ['', '.json', '.json5', '.yml']
  .map((x) => path.join(targetDir, program.indexFile + x));

let index = searches
  .map((x) => fs.existsSync(x))
  .indexOf(true);

if(index!==-1){
  let declarationArg = {};
  let d = new Declaration(
    declarationArg, // target folder
    targetDir
  );
  d.run((err) => {
    console.log('Building...');
    if(err){
      console.log('Critical building errors.', err.message);
      console.log('STOP.');
      process.exit(1);
    }else{
      console.log('OK.');
      process.exit(0);
    }
  });
}else{
  console.log('Index file is not found in\n', JSON.stringify(searches, null, 2));
  console.log('STOP.');
  process.exit(1);
}
