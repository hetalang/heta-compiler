const { _Scoped } = require('./_scoped');

class Switcher extends _Scoped {
  merge(q, skipChecking){
    if(!skipChecking) Switcher.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.condition!==undefined) this.condition = q.condition;

    return this;
  }
  static get schemaName(){
    return 'SwitcherP';
  }
  get className(){
    return 'Switcher';
  }
  toQ(){
    let res = super.toQ();
    res.condition = this.condition;
    return res;
  }
}

module.exports = {
  Switcher
};
