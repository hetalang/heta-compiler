const { _Switcher } = require('./_switcher');

class CondSwitcher extends _Switcher {
  merge(q, skipChecking){
    if(!skipChecking) CondSwitcher.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.condition!==undefined) this.condition = q.condition;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    res.condition = this.condition;
    return res;
  }
}

CondSwitcher._requirements = {
  condition: {
    required: true, 
    isReference: true, class: 'Record', setTarget: false
  }
};

module.exports = {
  CondSwitcher
};
