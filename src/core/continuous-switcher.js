const { _Switcher } = require('./_switcher');

class ContinuousSwitcher extends _Switcher {
  merge(q, skipChecking){
    if(!skipChecking) ContinuousSwitcher.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.condition!==undefined) this.condition = q.condition;

    return this;
  }
  toQ(){
    let res = super.toQ();
    res.condition = this.condition;
    return res;
  }
}

ContinuousSwitcher._requirements = {
  condition: {
    required: true, 
    isReference: true, class: 'Record', setTarget: false
  }
};

module.exports = {
  ContinuousSwitcher
};
