const { _Export } = require('../core/_export');
const path = require('path');
const fs = require('fs-extra');

/*
    save one or several output files to disk
*/
_Export.prototype.makeAndSave = function(pathPrefix){
  this.make().forEach((out) => {
    let relPath = [this.filepath || this.id, out.pathSuffix].join('');
    let fullPath = path.join(pathPrefix, relPath);
    fs.outputFileSync(fullPath, out.content);
  });
};

