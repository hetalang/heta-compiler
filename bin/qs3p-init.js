#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const path = require('path');
const download = require('download-git-repo');

const githubURL = 'insysbio/platform-template';

program
  .description('creates template platform files in directory')
  .usage('[options] [dir]')
  .option('-f, --force', 'rewrite files in target directory')
  .parse(process.argv);

let targetDir = path.resolve(program.args[0] || '.');
// console.log(targetDir);
/*
console.log('You are going to create an empty qs3p platform in directory: ' + targetDir);
if(!program.force && fs.existsSync(targetDir + '/platform.json5')){
  console.log('The file "platform.json5" is already exists. Use --force option for rewriting files.');
  process.exit(1);
}else{
  console.log(`Downloading template from "${githubURL}"...`);
  download(githubURL, targetDir, {clone: false}, (err) => {
    if(err){
      console.log('Cannot download with message: ', err.message);
      console.log('Platform template has not been initiated.');
      process.exit(1);
    }else{
      console.log('OK. Platform template has been initiated.');
    }
    console.error('DONE.');
  });
}
*/
