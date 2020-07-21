const { _Switcher } = require('./_switcher');
const _ = require('lodash');
const { Expression } = require('./expression');

/*
  DSwitcher class

  Switcher describing discrete events.

  ds1 @DSwitcher {
    trigger: cond1
  };
*/
class DSwitcher extends _Switcher {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = DSwitcher.isValid(q, logger);
    
    if (valid) {
      if (typeof q.trigger !== 'undefined') {
        try { // this is for the cases of wrong ExprString structure
          let expr = Expression.fromString(q.trigger);
          if (expr.hasBooleanResult()) {
            this.trigger = expr; 
          } else {
            let msg = `DSwitcher trigger "${this.index}" should be a boolean expression.`;
            logger && logger.error(msg, 'ValidationError');
          }
        } catch (err) {
          let msg = this.index + ' '+ err.message + ` "${q.trigger}"`;
          logger && logger.error(msg, 'ValidationError');
        }
      }
    }
    
    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.trigger) res.trigger = this.trigger.toString();
    return res;
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.trigger !== 'undefined')
      clonedComponent.trigger = this.trigger.clone();
    
    return clonedComponent;
  }
  updateReferences(q = {}){
    super.updateReferences(q);
    
    // check math expression refs
    if (typeof this.trigger === 'undefined') {
      this.trigger.updateReferences(q);
    }
  }
}

DSwitcher._requirements = {
  trigger: {
    required: true, 
    isReference: false, 
  }
};

module.exports = {
  DSwitcher
};
