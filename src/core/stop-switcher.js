const { _Switcher } = require('./_switcher');
const { Expression } = require('./expression');

/*
  StopSwitcher class (experimental)

  Stop simulation at specific condition.

  ss1 @StopSwitcher {
    trigger: S > P
  };
*/
class StopSwitcher extends _Switcher {
  merge(q = {}) {
    super.merge(q);
    let logger = this.namespace?.container?.logger;
    let valid = StopSwitcher.isValid(q, logger);
    
    if (valid) {
      if (q.trigger === null) {
        delete this.trigger;
      } else if (typeof q.trigger !== 'undefined') {
        q.trigger += '';
        try { // this is for the cases of wrong ExprString structure
          let expr = Expression.fromString(q.trigger);
          if (expr.hasBooleanResult()) {
            this.trigger = expr; 
          } else {
            let msg = `StopSwitcher trigger "${this.index}" should be a boolean expression.`;
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
  get className() {
    return 'StopSwitcher';
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
    let {logger, functionDefStorage} = this.namespace.container;

    // get list of 
    this.trigger && this.trigger.dependOnNodes().forEach((node) => {
      let target = namespace.get(node.name);

      if (!target) {
        let msg = `Component "${node.name}" is not found in space "${this.space}" as expected in StopSwitcher: "${this.index}"`
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

    // check references to function definitions
    this.trigger && this.trigger.functionList().forEach((functionNode) => {
      // find target functionDef
      let target = functionDefStorage.get(functionNode.fn.name);
      if (!target) {
        let msg = `FunctionDef "${functionNode.fn.name}" is not found as expected here: `
          + `${this.index} { trigger: ${this.trigger} };`;
        logger.error(msg, {type: 'BindingError'});
      } else {
        // functionNode.functionObj = target; // not used
      }

      // check arguments in functionNode
      if (target?.arguments && functionNode.args.length < target.arguments.length) {
        let msg = `StopSwitcher "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`;
        logger.error(msg, {type: 'BindingError'});
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
      let rightSideUnit = this.trigger.calcUnit(this);
      if (typeof rightSideUnit === 'undefined') {
        logger.warn(`Cannot calculate trigger units in "${this.index}".`);
      }
    }
  }
}

StopSwitcher._requirements = {
  trigger: {
    required: true, 
    isReference: false
  }
};

module.exports = {
  StopSwitcher
};
