const { _Component } = require('./_component');

class _Export extends _Component {
  constructor(q = {}){
    super(q);
  }
  merge(q, skipChecking){
    if(!skipChecking) _Export.isValid(q);
    super.merge(q, skipChecking);
    if(q.filepath) this.filepath = q.filepath;

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
