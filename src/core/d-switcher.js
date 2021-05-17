const { _Switcher } = require('./_switcher');
const _ = require('lodash');
const { Expression } = require('./expression');

/*
  DSwitcher class

  Switcher describing discrete events.

  ds1 @DSwitcher {
    trigger: S>P
  };
*/
class DSwitcher extends _Switcher {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = DSwitcher.isValid(q, logger);
    
    if (valid) {
      if (typeof q.trigger !== 'undefined') {
        q.trigger += '';
        try { // this is for the cases of wrong ExprString structure
          let expr = Expression.fromString(q.trigger);
          expr._logger = logger;
          if (expr.hasBooleanResult()) {
            this.trigger = expr; 
          } else {
            let msg = `DSwitcher trigger "${this.index}" should be a boolean expression.`;
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
    let deps = this.trigger ? this.trigger.dependOnNodes() : [];

    deps.forEach((node) => {
      let target = namespace.get(node.name);

      if (!target) {
        let msg = `Component "${node.name}" is not found in space "${this.space}" as expected in DSwitcher: "${this.index}"`
              + `\n\t${this.trigger.toString()};`;
        logger.error(msg, {type: 'BindingError', space: this.space});
        this.errored = true;
      } else if (!target.instanceOf('_Size')) {
        let msg = `Component "${node.name}" is not a Const/Record/TimeScale class as expected in expression: `
          + `${this.trigger.toString()};`;
        logger.error(msg, {type: 'BindingError', space: this.space});
        this.errored = true;
      } else {
        node.nameObj = target;
      }
    });
  }
  /*
  Check units recursively for mathematical expressions
  Works only for bound switchers
  */
  checkUnits(){
    let logger = this.namespace.container.logger;

    if (typeof this.trigger !== 'undefined') { // skip empty
      let rightSideUnit = this.trigger.exprParsed.calcUnit(this);
      if (typeof rightSideUnit === 'undefined') {
        logger.warn(`Cannot calculate trigger units in "${this.index}".`);
      }
    }
  }
}

DSwitcher._requirements = {
  trigger: {
    required: true, 
    isReference: false
  }
};

module.exports = {
  DSwitcher
};
