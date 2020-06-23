const { _Switcher } = require('./_switcher');
const _ = require('lodash');

/*
  CSwitcher class

  cs1 @CSwitcher {
    condition: cond1
  };
*/
class CSwitcher extends _Switcher {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = CSwitcher.isValid(q, logger);
    
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

CSwitcher._requirements = {
  condition: {
    required: true, 
    isReference: true, class: 'Record', setTarget: false
  }
};

module.exports = {
  CSwitcher
};
