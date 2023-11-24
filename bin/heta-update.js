#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const { exec } = require('child_process');
const { name, version } = require('../package.json');

program
  .name('heta init')
  .description('Update heta-compiler to the latest version.')
  .parse(process.argv);

exec(`npm install --global ${name}`, (err, stdout, stderr) => {
  if (stderr) {
    process.stdout.write(stderr);
    process.exit(1); // BRAKE
  }

  let newVersion = stdout.match(/\w+@([\d.]*)/)[1]; // '0.99.0';
  if (newVersion === version) {
    process.stdout.write(`${name} is already up to date ${version}\n`);
  } else {
    process.stdout.write(`${name} was updated from ${version} to ${newVersion}\n`);
  }
});
