const { _Switcher } = require('./_switcher');
const { Expression } = require('./expression');
const HetaLevelError = require('../heta-level-error');

const { ajv } = require('../ajv');

const schema = {
  type: "object",
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
  StopSwitcher class (experimental)

  Stop simulation at specific condition.

  ss1 @StopSwitcher {
    trigger: S > P
  };
*/
class StopSwitcher extends _Switcher {
  merge(q = {}) {
    super.merge(q);
    let logger = this._container?.logger;
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
            logger?.error(
              `StopSwitcher trigger "${this.index}" should be a boolean expression.`, 
              {diagnosticCode: 'EXPECTED_BOOLEAN_EXPRESSION', space: this.space, id: this.id, expression: q.trigger, path: 'trigger'}
            );
          }
        } catch (error) {
          if (!(error instanceof HetaLevelError)) throw error;
          let msg = this.index + ' ' + error.message + ` "${q.trigger}"`;
          logger?.error(msg, {...error.opt, space: this.space, id: this.id, expression: q.trigger, path: 'trigger'});
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
    let {logger, functionDefStorage} = this._container;

    // get list of 
    this.trigger && this.trigger.dependOnNodes().forEach((node) => {
      let target = namespace.get(node.name);

      if (!target) {
        let msg = `Component "${node.name}" is not found in space "${this.space}" as expected in StopSwitcher: "${this.index}"`
              + `\n\t${this.trigger.toString()};`;
        logger.error(
          msg,
          {diagnosticCode: 'MISSING_REFERENCE', space: this.space, id: this.id, path: 'trigger', reference: node.name, expression: this.trigger.toString()}
        );
        this.errored = true;
      } else if (!target.instanceOf('_Size')) {
        let msg = `Component "${node.name}" is not a Const/Record/TimeScale class as expected in expression: `
          + `${this.trigger.toString()};`;
        logger.error(
          msg,
          {diagnosticCode: 'WRONG_REFERENCE_TYPE', space: this.space, id: this.id, path: 'trigger', reference: node.name, expression: this.trigger.toString(), expectedClass: '_Size', actualClass: target.className}
        );
        this.errored = true;
      } else {
        node.nameObj = target;
      }
    });

    // check references to function definitions
    this.trigger && this.trigger.functionList(false).forEach((functionNode) => {
      // find target functionDef
      let target = functionDefStorage.get(functionNode.fn.name);
      if (!target) {
        let msg = `FunctionDef "${functionNode.fn.name}" is not found as expected here: `
          + `${this.index} { trigger: ${this.trigger} };`;
        logger.error(
          msg,
          {diagnosticCode: 'UNKNOWN_FUNCTION', space: this.space, id: this.id, path: 'trigger', functionId: functionNode.fn.name, expression: this.trigger.toString()}
        );
      } else {
        functionNode.fnObj = target; // not used
      }

      // check arguments in functionNode
      if (target?.arguments && functionNode.args.length < target.arguments.length) {
        logger?.error(
          `StopSwitcher "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`, 
          {diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: functionNode.fn.name, requiredArguments: target.arguments.length, providedArguments: functionNode.args.length, id: this.id, space: this.space, path: 'trigger'}
        );
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
        logger.warn(
          `Cannot calculate trigger units in "${this.index}".`,
          {diagnosticCode: 'UNIT_CALCULATION_FAILED', space: this.space, id: this.id, path: 'trigger', expression: this.trigger.toString()}
        );
      }
    }
  }
  static get validate() {
    return ajv.compile(schema);
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
