const { _Simple } = require('./_simple');

class _Export extends _Simple{
  merge(q, skipChecking){
    if(!skipChecking) _Export.isValid(q);
    super.merge(q, skipChecking);

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
    return res;
  }
}

module.exports = { _Export };
