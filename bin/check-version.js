const colors = require('colors/safe');
const npm = require('npm');
const pkg = require('../package');
const semver = require('semver');

const currentVersion = pkg.version;
const changelogLink = 'https://hetalang.github.io/#/heta-compiler/CHANGELOG';

// npm show heta-compiler version
function checkVersion(callback){
    npm.load({ loglevel: 'silent' }, (err) => {
        // A hack to shut the NPM registry the hell up.
        if (npm && npm.registry && npm.registry.log && npm.registry.log.level)
            npm.registry.log.level = 'silent';
    
        if (err) {
            callback(err);
            return;
        }
    
        npm.commands.view(['heta-compiler'], true, (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            if (typeof data !== 'undefined') {
                let latestVersion = Object.keys(data)[0];
                if (semver.lt(currentVersion, latestVersion)) { // installed is not the latest
                    msg = [
                        colors.magenta.italic('FYI. Newer version of heta-compiler is available.'),
                        colors.magenta.italic(`See changes here: ${changelogLink}`),
                        colors.magenta(`Run "npm i -g heta-compiler" to update ${currentVersion} => ${latestVersion}`)
                    ];
                    process.stdout.write(msg.join('\n'));
                }
            }
            callback();
        });
    });
}

module.exports = { checkVersion };