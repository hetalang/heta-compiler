const colors = require('colors/safe');
const fetch = require('node-fetch');
const pkg = require('../package');
const semver = require('semver');

const currentVersion = pkg.version;
const changelogLink = 'https://hetalang.github.io/#/heta-compiler/CHANGELOG';
const NPM_REF = 'http://registry.npmjs.org/-/package/heta-compiler/dist-tags';

async function getLatestVersionAsync(){
  try {
    var response = await fetch(NPM_REF);
  } catch (e) {
    return; // BRAKE
  }
  let json = await response.json();
  
  return json.latest;
}

async function printVersionMessage(){
  let latestVersion = await getLatestVersionAsync('heta-compiler');

  let shouldPrint = latestVersion !== undefined 
      && semver.lt(currentVersion, latestVersion); // installed version is not the latest one
  if (shouldPrint) { 
    let msg = [
      colors.magenta.italic('FYI. Newer version of heta-compiler is available.'),
      colors.magenta.italic(`See changes here: ${changelogLink}`),
      colors.magenta(`Run "heta update" to update ${currentVersion} => ${latestVersion}`),
      '',''
    ];
    process.stdout.write(msg.join('\n'));
  }
}

module.exports = { printVersionMessage };
