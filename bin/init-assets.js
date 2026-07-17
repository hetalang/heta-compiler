'use strict';

const fs = require('fs-extra');
const path = require('path');

let sea;
try {
  sea = require('node:sea');
} catch {
  // node:sea is unavailable on older Node versions supported by the npm package.
}

const isSea = sea?.isSea() === true;

function copyInitAsset(name, destination, options) {
  if (!isSea) {
    fs.copySync(path.join(__dirname, 'init', name), destination, options);
    return;
  }

  if (options?.overwrite === false && fs.existsSync(destination)) {
    if (options.errorOnExist) {
      throw new Error(`'${destination}' already exists`);
    }
    return;
  }

  const bytes = new Uint8Array(sea.getRawAsset(`init/${name}`));
  fs.outputFileSync(destination, bytes);
}

module.exports = { copyInitAsset };
