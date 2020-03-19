const { _Switcher } = require('./_switcher');

/*
  CondSwitcher class

  cs1 @CondSwitcher {
    condition: cond1
  };
*/
class CondSwitcher extends _Switcher {
  merge(q = {}){
    super.merge(q);
    let validationLogger = CondSwitcher.isValid(q);
    
    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if(q.condition!==undefined) this.condition = q.condition;
    }
    
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
