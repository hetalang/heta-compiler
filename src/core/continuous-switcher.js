const { _Switcher } = require('./_switcher');

class ContinuousSwitcher extends _Switcher {
  merge(q, skipChecking){
    if(!skipChecking) ContinuousSwitcher.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.condition!==undefined) this.condition = q.condition;

    return this;
  }
  static get schemaName(){
    return 'ContinuousSwitcherP';
  }
  get className(){
    return 'ContinuousSwitcher';
  }
  toQ(){
    let res = super.toQ();
    res.condition = this.condition;
    return res;
  }
}

module.exports = {
  ContinuousSwitcher
};
