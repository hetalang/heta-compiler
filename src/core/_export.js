const { _Component } = require('./_component');
const { ExportError } = require('../heta-error');
const path = require('path');
const fs = require('fs-extra');

/*
  _Export class

  export1 @_Export {
    filepath: ../dir1,
    powTransform: keep // possible values are: keep/operator/function
  };
*/
class _Export extends _Component {
  constructor(isCore = false){
    super(isCore);
    this.powTransform = 'keep';
  }
  merge(q, skipChecking){
    if(!skipChecking) _Export.isValid(q);
    super.merge(q, skipChecking);
    if(q.filepath) this.filepath = q.filepath;
    if(q.powTransform) this.powTransform = q.powTransform;

    return this;
  }
  static get schemaName(){
    return '_ExportP';
  }
  /*
    Method creates exported files.
    return in format 
    [{
      content: <String>, // output text file
      pathSuffix: <String>, // relative path to output file
      type: 'text' // currently support only text
    }]
  */
  make(){
    throw new ExportError(`No method make() for "${this.clasName}"`);
  }
  /*
    save one or several output files to disk
  */
  makeAndSave(pathPrefix){
    this.make().forEach((out) => {
      let relPath = [this.filepath || this.id, out.pathSuffix].join('');
      let fullPath = path.join(pathPrefix, relPath);
      fs.outputFileSync(fullPath, out.content);
    });
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.filepath) res.filepath = this.filepath;
    if(this.powTransform!=='keep') res.powTransform = this.powTransform;

    return res;
  }
}

_Export._requirements = {
  defaultTask: { 
    required: false,
    isReference: true, targetClass: 'SimpleTask', setTarget: true 
  }
};

module.exports = { _Export };
