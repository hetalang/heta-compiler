const { _Component } = require('./_component');
const { ExportError } = require('../heta-error');
const path = require('path');
const fs = require('fs-extra');

class _Export extends _Component {
  constructor(q = {}){
    super(q);
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
  do(){ // error for abstract class
    throw new ExportError(`No method do() for "${this.className}".`);
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
    sva one or several output foles to disk
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
