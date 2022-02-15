const { AbstractExport } = require('../core/abstract-export');
const path = require('path');
const fs = require('fs-extra');

/*
    save one or several output files to disk
*/
AbstractExport.prototype.makeAndSave = function(pathPrefix){
  this.make().forEach((out) => {
    let relPath = [this.filepath || this.id, out.pathSuffix].join('');
    let fullPath = path.resolve(pathPrefix, relPath);
    fs.outputFileSync(fullPath, out.content);
  });
};
