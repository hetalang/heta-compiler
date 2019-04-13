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
  get className(){
    return '_Export';
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

module.exports = { _Export };
