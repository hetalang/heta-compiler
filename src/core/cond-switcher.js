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
    let logger = this.namespace.container.logger;
    let valid = CondSwitcher.isValid(q, logger);
    
    if (valid) {
      if (q.condition!==undefined) this.condition = q.condition;
    }
    
    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    res.condition = this.condition;
    return res;
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.condition !== 'undefined')
      clonedComponent.condition = this.condition;
    
    return clonedComponent;
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
