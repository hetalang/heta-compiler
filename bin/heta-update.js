#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const { exec } = require('child_process');
const { name, version } = require('../package.json');

program
  .name('heta update')
  .description('Update heta-compiler to the latest version published in NPM, or selected version if argument is set.')
  .usage('[version]')
  .parse(process.argv);

let forceVersion = program.args[0] || 'latest';

exec(`npm install --global ${name}@${forceVersion}`, (err, stdout, stderr) => {
  if (stderr) {
    process.stdout.write(stderr);
    process.exit(1); // BRAKE
  }

  exec(`npm view ${name} version`, (err, stdout, stderr) => {
    if (stderr) {
      process.stdout.write(stderr);
      process.exit(1); // BRAKE
    }
    let newVersion = stdout.trim(); // '0.99.0';
    if (newVersion === version) {
      process.stdout.write(`${name} of version ${version} was not updated\n`);
    } else {
      process.stdout.write(`${name} was updated from ${version} to ${newVersion}\n`);
    }

  });
});
