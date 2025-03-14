#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const fs = require('fs-extra');
const path = require('path');
const { prompt } = require('inquirer');
const pkg = require('../package');

// for the development of JSON schema
// we use https://docs.npmjs.com/files/package.json

const defaultPlatform = {
  '$schema': 'https://hetalang.github.io/heta-compiler/declaration-schema.json',
  id: 'template',
  notes: 'platform notes',
  version: 'v0.1.0',
  keywords: [],
  //homepage: '',
  //repository: {url: '', type: 'git'},
  license: 'UNLICENSED', // for not published
  //private: false,
  contributors: [],
  builderVersion: '^' + pkg.version,
  options: {
    debug: false,
    unitsCheck: false
  },
  //script: {
  //  afterInit: null,
  //  afterImports: null,
  //  afterExports: null
  //},
  importModule: {
    type: 'heta',
    source: 'src/index.heta'
  },
  export: [
    '{ format: JSON, omit: [], noUnitsExpr: false }',
    '#{ format: YAML, omit: [], noUnitsExpr: false }',
    '#{ format: DBSolve, powTransform: keep, version: 26 }',
    '#{ format: SLV, eventsOff: false, powTransform: keep, version: 26 }',
    '#{ format: SBML, version: L2V4 }',
    '#{ format: Simbio }',
    '#{ format: Mrgsolve }',
    '#{ format: Table, omitRows: 0, omit: [], bookType: csv, splitByClass: false }',
    '#{ format: XLSX, omitRows: 0, omit: [], splitByClass: true }',
    '#{ format: Julia }',
    '#{ format: Matlab }',
    '#{ format: Dot }',
    '#{ format: Summary }'
  ]
};

program
  .name('heta init')
  .description('Creates template heta platform files in directory')
  .usage('[options] [dir]')
  .option('-f, --force', 'rewrite files in target directory')
  .option('-s, --silent', 'use silent mode with default options')
  .parse(process.argv);

let args = program.args;
let opts = program.opts();

// initialize file paths
let targetDir = path.normalize(args[0] || '.');
let filePath = path.join(targetDir, 'platform.yml');
console.log('Creating a template platform in directory: "' + targetDir + '"...');

// directory does not exist
if(!opts.force && !fs.existsSync(targetDir)){
  console.log(`Directory ${targetDir} does not exist. Use --force option to create directory.`);
  console.log('STOP.');
  process.exit(1);
}

// files already exists
if(!opts.force && fs.existsSync(filePath)){
  console.log('"platform.json" file already exists. Use --force option to rewrite file.');
  console.log('STOP.');
  process.exit(1);
}

// silent mode
if (opts.silent) {
  let platform = defaultPlatform;

  // saving files
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
  // create files in src
  let hetaIndexFile = path.join(targetDir, 'src', 'index.heta');
  fs.copySync(
    path.join(__dirname, './init/index0.heta'),
    hetaIndexFile
  );

  // saving qsp-units.heta and qsp-functions.heta
  fs.copySync(
    path.join(__dirname, './init/qsp-units.heta'),
    path.join(targetDir, 'src/qsp-units.heta')
  );
  fs.copySync(
    path.join(__dirname, './init/qsp-functions.heta'),
    path.join(targetDir, 'src/qsp-functions.heta')
  );

  //fs.outputJsonSync(filePath, platform, {spaces: 2});
  let json = JSON.stringify(platform, null, 2);
  let yaml = json.replace(/"/g, '');
  fs.writeFileSync(filePath, yaml);

  console.log('Platform template is created in silent mode.');
  console.log('DONE.');
  process.exit(0);
}

// prepare platform
let questions = [
  { type: 'input', name: 'id', message: 'Platform id', default: defaultPlatform.id },
  { type: 'input', name: 'notes', message: 'Platform notes', default: defaultPlatform.notes },
  { type: 'input', name: 'version', message: 'Platform version', default: defaultPlatform.version },
  { type: 'input', name: 'license', message: 'Platform license', default: defaultPlatform.license },
  { type: 'confirm', name: 'options', message: 'Set options', default: false },
  { type: 'list', name: 'importModule', message: 'Select file types', default: 'heta', choices: ['heta', 'heta+xlsx', 'heta+xlsx extended', 'xlsx', 'json', 'yaml']}
];
prompt(questions)
  .then((answers) => {
    let platform = Object.assign({
      builderVersion: defaultPlatform.builderVersion
    }, answers);
    platform.options = answers.options
      ? defaultPlatform.options
      : {};

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
    } else if (answers.importModule === 'heta+xlsx extended') {
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
          path.join(__dirname, './init/table-ext.xlsx'),
          xlsxTableFile
        );
      }
    } else if (answers.importModule==='xlsx') {
      platform.importModule = {
        type: 'xlsx',
        source: 'src/table.xlsx',
        sheet: 0,
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

    // add export formats
    platform.export = defaultPlatform.export;

    // saving qsp-units.heta and qsp-functions.heta
    fs.copySync(
      path.join(__dirname, './init/qsp-units.heta'),
      path.join(targetDir, 'src/qsp-units.heta')
    );
    fs.copySync(
      path.join(__dirname, './init/qsp-functions.heta'),
      path.join(targetDir, 'src/qsp-functions.heta')
    );
    // saving platform file
    //fs.outputJsonSync(filePath, platform, {spaces: 2});
    let json = JSON.stringify(platform, null, 2);
    let yaml = json.replace(/"/g, '');
    fs.writeFileSync(filePath, yaml);
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
