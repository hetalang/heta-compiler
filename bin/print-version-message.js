const colors = require('colors/safe');
const npm = require('npm');
const pkg = require('../package');
const semver = require('semver');
const util = require('util');

const currentVersion = pkg.version;
const changelogLink = 'https://hetalang.github.io/#/heta-compiler/CHANGELOG';

// npm show heta-compiler version
function getLatestVersion(package, callback){
    npm.load({ loglevel: 'silent' }, (err) => {
        // A hack to shut the NPM registry the hell up.
        if (npm && npm.registry && npm.registry.log && npm.registry.log.level)
            npm.registry.log.level = 'silent';
    
        if (err) {
            callback(err);
            return;
        }
    
        npm.commands.view([package], true, (err, data) => {
            if (err) {
                callback(err);
            } else if (typeof data !== 'undefined') {
                let version = Object.keys(data)[0];
                callback(null, version);
            } else {
                callback(null, undefined);
            }
        });
    });
}

const getLatestVersionAsync = util.promisify(getLatestVersion);

async function printVersionMessage(){
    let latestVersion = await getLatestVersionAsync('heta-compiler');

    let shouldPrint = typeof latestVersion !== undefined 
        && semver.lt(currentVersion, latestVersion); // installed version is not the latest one
    if (shouldPrint) { 
        msg = [
            colors.magenta.italic('FYI. Newer version of heta-compiler is available.'),
            colors.magenta.italic(`See changes here: ${changelogLink}`),
            colors.magenta(`Run "npm i -g heta-compiler" to update ${currentVersion} => ${latestVersion}`),
            '',''
        ];
        process.stdout.write(msg.join('\n'));
    }
}

module.exports = { printVersionMessage };
