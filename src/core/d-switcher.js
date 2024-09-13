const { _Switcher } = require('./_switcher');
const { Expression } = require('./expression');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    trigger: {oneOf: [
        { '$ref': '#/definitions/ExprString' },
        { enum: [true, false, 1, 0] },
        { type: 'null' }
      ]
    }
  },
  definitions: {
    ExprString: {
      description: 'Expression as string. Currently pattern does not analyze expressions.',
      type: 'string',
      minLength: 1,
      pattern: '[a-zA-Z0-9. -+/*^()]*$'
    }
  }
};

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
    let logger = this._container?.logger;
    let valid = DSwitcher.isValid(q, logger);
    
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
  get className() {
    return 'DSwitcher';
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
    if (typeof this.trigger !== 'undefined') {
      this.trigger.updateReferences(q);
    }
  }
  bind(namespace){
    super.bind(namespace);
    let {logger, functionDefStorage} = this._container;

    // get list of 
    this.trigger && this.trigger.dependOnNodes().forEach((node) => {
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
        let msg = `DSwitcher "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`;
        logger.error(msg, {type: 'BindingError'});
      }
    });
  }
  /*
  Check units recursively for mathematical expressions
  Works only for bound switchers
  */
  checkUnits(){
    let logger = this._container?.logger;

    if (typeof this.trigger !== 'undefined') { // skip empty
      let rightSideUnit = this.trigger.calcUnit(this);
      if (typeof rightSideUnit === 'undefined') {
        logger.warn(`Cannot calculate trigger units in "${this.index}".`);
      }
    }
  }
  static get validate() {
    return ajv.compile(schema);
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
