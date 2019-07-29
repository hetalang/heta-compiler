const { _Scoped } = require('./_scoped');

class _Switcher extends _Scoped{
  merge(q, skipChecking){
    if(!skipChecking) _Switcher.isValid(q);
    super.merge(q, skipChecking);

    return this;
  }
  static get schemaName(){
    return '_SwitcherP';
  }
  get className(){
    return '_Switcher';
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

module.exports = { _Switcher };
