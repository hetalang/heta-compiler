const { _Switcher } = require('./_switcher');
const _ = require('lodash');
const { Expression } = require('./expression');

/*
  CSwitcher class

  cs1 @CSwitcher {
    trigger: cond1
  };
*/
class CSwitcher extends _Switcher {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = CSwitcher.isValid(q, logger);
    
    if (valid) {
      if (typeof q.trigger !== 'undefined') {
        try { // this is for the cases of wrong ExprString structure
          let expr = Expression.fromString(q.trigger);
          if (!expr.hasBooleanResult()) {
            this.trigger = expr; 
          } else {
            let msg = `CSwitcher trigger "${this.index}" should be a numeric expression.`;
            logger && logger.error(msg, {type: 'ValidationError', space: this.space});
          }
        } catch (err) {
          let msg = this.index + ' ' + err.message + ` "${q.trigger}"`;
          logger && logger.error(msg, {type: 'ValidationError', space: this.space});
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
  bind(namespace){
    super.bind(namespace);
    let logger = this.namespace.container.logger;

    // get list of 
    let deps = this.trigger
      ? this.trigger.dependOn()
      : [];

    deps.forEach((id) => {
      let target = namespace.get(id);

      if (!target) {
        let msg = `Component "${id}" is not found in space "${this.space}" as expected in CSwitcher: "${this.index}"`
              + `\n\t${this.trigger.toString()};`;
        logger.error(msg, {type: 'BindingError', space: this.space});
      } else if (!target.instanceOf('Const') && !target.instanceOf('Record')) {
        let msg = `Component "${id}" is not a Const or Record class as expected in expression: `
          + `${this.trigger.toString()};`;
        logger.error(msg, {type: 'BindingError', space: this.space});
      }
    });
  }
}

CSwitcher._requirements = {
  trigger: {
    required: true, 
    isReference: false
  }
};

module.exports = {
  CSwitcher
};
