const { _Component } = require('./_component');

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
    throw new Error(`No method do() for "${this.className}".`);
  }
  toQ(){
    let res = super.toQ();
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
