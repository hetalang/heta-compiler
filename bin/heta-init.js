#!/usr/bin/env node
const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { prompt } = require('inquirer');
const pkg = require('../package');

// for the development of JSON schema
// we use https://docs.npmjs.com/files/package.json

const defaultPlatform = {
  '$schema': 'https://github.com/insysbio/heta-compiler#',
  id: 'template',
  title: 'platform title',
  notes: 'platform notes',
  version: 'v0.1.0',
  keywords: [],
  //homepage: '',
  //repository: {url: '', type: 'git'},
  license: 'UNLICENSED', // for not published
  //private: false,
  constributors: [],
  builderVersion: '^' + pkg.version,
  options: {
    debuggingMode: false,
    logs: 'output.log',
    logLevel: 'info',
    skipExport: false
  },
  //script: {
  //  afterInit: null,
  //  afterImports: null,
  //  afterExports: null
  //},
  importModule: {
    type: 'heta',
    source: 'src/index.heta'
  }
};

program
  .description('Creates template heta platform files in directory')
  .usage('[options] [dir]')
  .option('-f, --force', 'rewrite files in target directory')
  .option('-s, --silent', 'use silent mode with default options')
  .parse(process.argv);

// initialize file paths
let targetDir = path.resolve(program.args[0] || '.');
let filePath = path.join(targetDir, 'platform.json');
console.log('Creating a template platform in directory: "' + targetDir + '"...');

// directory does not exist
if(!program.force && !fs.existsSync(targetDir)){
  console.log(`Directory ${targetDir} does not exist. Use --force option to create directory.`);
  console.log('STOP.');
  process.exit(1);
}

// files already exists
if(!program.force && fs.existsSync(filePath)){
  console.log('"platform.json" file already exists. Use --force option to rewrite file.');
  console.log('STOP.');
  process.exit(1);
}

// silent mode
if(program.silent){
  let platform = defaultPlatform;

  // saving files
  fs.outputJsonSync(filePath, platform, {spaces: 2});
  // saving .gitignore
  fs.copySync(
    path.join(__dirname, './init/.gitignore'),
    path.join(targetDir, '.gitignore')
  );

  console.log('Platform template is created in silent mode.');
  console.log('DONE.');
  process.exit(0);
}

// prepare platform
let questions = [
  { type: 'input', name: 'id', message: 'Platform id', default: defaultPlatform.id },
  { type: 'input', name: 'title', message: 'Platform title', default: defaultPlatform.title },
  { type: 'input', name: 'version', message: 'Platform version', default: defaultPlatform.version },
  { type: 'input', name: 'license', message: 'Platform license', default: defaultPlatform.license },
  { type: 'confirm', name: 'options', message: 'Set options', default: false },
  { type: 'list', name: 'importModule', message: 'Select file types', default: 'heta', choices: ['heta', 'heta+xlsx', 'xlsx', 'json', 'yaml']}
];
prompt(questions)
  .then((answers) => {
    let platform = Object.assign({
      builderVersion: defaultPlatform.builderVersion,
      notes: 'Write platform notes here'
    }, answers);
    platform.options = answers.options
      ? defaultPlatform.options
      : undefined;

    // select files
    if (answers.importModule==='heta') {
      platform.importModule = defaultPlatform.importModule;
      
      // create files in src
      let hetaIndexFile = path.join(targetDir, 'src', 'index.heta');
      if(!fs.existsSync(hetaIndexFile)){
        fs.copySync(
          path.join(__dirname, './init/index0.heta'), 
          hetaIndexFile,
          { overwrite: true, errorOnExist: true }
        );
      }
    } else if (answers.importModule==='heta+xlsx') {
      platform.importModule = defaultPlatform.importModule;
      
      // create files in src
      let hetaIndexFile = path.join(targetDir, 'src', 'index.heta');
      if(!fs.existsSync(hetaIndexFile)){
        fs.copySync(
          path.join(__dirname, './init/index1.heta'),
          hetaIndexFile
        );
      }
      let xlsxTableFile = path.join(targetDir, 'src', 'table.xlsx');
      if(!fs.existsSync(xlsxTableFile)){
        fs.copySync(
          path.join(__dirname, './init/table.xlsx'),
          xlsxTableFile
        );
      }
    } else if (answers.importModule==='xlsx') {
      platform.importModule = {
        type: 'xlsx',
        source: 'src/table.xlsx',
        sheet: 1,
        omitRows: 3
      };

      // create files in src
      let xlsxTableFile = path.join(targetDir, 'src', 'table.xlsx');
      if(!fs.existsSync(xlsxTableFile)){
        fs.copySync(
          path.join(__dirname, './init/table.xlsx'),
          xlsxTableFile
        );
      }
    } else if (answers.importModule==='json') {
      platform.importModule = {
        type: 'json',
        source: 'src/index.json'
      };

      // create files in src
      let jsonIndexFile = path.join(targetDir, 'src', 'index.json');
      if(!fs.existsSync(jsonIndexFile)){
        fs.copySync(
          path.join(__dirname, './init/index.json'),
          jsonIndexFile
        );
      }
    } else if (answers.importModule==='yaml') {
      platform.importModule = {
        type: 'yaml',
        filename: 'src/index.yml'
      };

      // create files in src
      let yamlIndexFile = path.join(targetDir, 'src', 'index.yml');
      if(!fs.existsSync(yamlIndexFile)){
        fs.copySync(
          path.join(__dirname, './init/index.yml'),
          yamlIndexFile
        );
      }
    }

    // saving qsp-units.heta
    fs.copySync(
      path.join(__dirname, './init/qsp-units.heta'),
      path.join(targetDir, 'src/qsp-units.heta')
    );
    // saving platform file
    fs.outputJsonSync(filePath, platform, {spaces: 2});
    // saving .gitignore
    fs.copySync(
      path.join(__dirname, './init/template.gitignore'),
      path.join(targetDir, '.gitignore')
    );
    // saving .gitattributes
    fs.copySync(
      path.join(__dirname, './init/template.gitattributes'),
      path.join(targetDir, '.gitattributes')
    );

    console.log('Platform template is created.');
    console.log(JSON.stringify(platform, null, 2));
    console.log('DONE.');
    process.exit(0);
  });
