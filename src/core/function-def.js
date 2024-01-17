const { Top } = require('./top');
const { ajv } = require('../utils');
const { Expression } = require('./expression');

const schema = {
  type: 'object',
  required: ['id'],
  properties: {
    arguments: {
      type: 'array',
      items: { '$ref': '#/definitions/ID' }
    },
    
    math: { '$ref': '#/definitions/ExprString' },
  },

  definitions: {
    ID: {
      description: 'First character is letter, others are letter, digit or underscore.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    },

    ExprString: {
      description: 'Expression as string. Currently pattern does not analyze expressions.',
      type: 'string',
      minLength: 1,
      pattern: '[a-zA-Z0-9. -+/*^()]*$'
    },
  }
};

/*
  // example:
  func1 #defineFunction {
    arguments: [x1, x2, x3],
    math: sqrt(x1^2 + x2^2 + x3^2)
  };
*/
class FunctionDef extends Top {
  constructor(q = {}, isCore = false) {
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = FunctionDef.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    // undefined arguments means it can be anything (for core elements)
    if (q.arguments) {
      this.arguments = q.arguments;
    } else if (q.math) {
      let msg = `The FunctionDef ${q.id} with "math" property must have "arguments".`;
      logger && logger.error(msg, {type: 'ValidationError'});
      this.errored = true;
    }
    
    if (q.math) {
      try {
        var expr = Expression.fromString(q.math);
        expr._logger = logger;
        if (!expr.hasBooleanResult()) {
          this.math = expr;
        } else {
          let msg = `Function math "${this.id}" should be a numeric expression.`;
          logger && logger.error(msg, {type: 'ValidationError'});
          this.errored = true;
        }
      } catch (e) {
        let msg = this.id + ': '+ e.message + ` in "${q.math.toString()}"`;
        logger && logger.error(msg, {type: 'ValidationError'});
        this.errored = true;
      }

      // check that identifiers in `math` correspond to `arguments`
      let lostVariables = expr.dependOn()
        .filter((v) => this.arguments?.indexOf(v) === -1);
      if (lostVariables.length > 0) {
        let msg = this.id + ': '+ `variables [${lostVariables.join(', ')}] are presented in math but not in arguments.`;
        logger && logger.error(msg, {type: 'ValidationError'});
        this.errored = true;
      }
    }
  }
  get className(){
    return 'FunctionDef';
  }
  static get validate() {
    return ajv.compile(schema);
  }
  bind() {
    // super.bind();
    let {logger, functionDefStorage} = this._container;

    if (this.math) { // if math is presented then it is user-defined functions
      // find and set reference to other functions
      this.math.functionList().forEach((functionNode) => {
        // find target functionDef
        let target = functionDefStorage.get(functionNode.fn.name);
        if (!target) {
          let msg = `FunctionDef "${functionNode.fn.name}" is not found as expected here: `
          + `${this.index} { math: ${this.math} };`;
          logger.error(msg, {type: 'BindingError'});
        } else {
          // functionNode.functionObj = target; // not used
        }

        // check arguments in functionNode
        if (target && functionNode.args.length < target.arguments.length) {
          let msg = `FunctionDef "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`;
          logger.error(msg, {type: 'BindingError'});
        }
      });
    }
  }
  _toQ(options = {}) {
    let q = super._toQ(options);

    if (this.arguments && this.arguments.length > 0) {
      q.arguments = this.arguments.map((x) => x);
    }
    if (this.math) {
      q.math = this.math.toString(options);
    }

    return q;
  }
  toQ(options = {}) {
    let q = this._toQ(options);
    q.action = 'defineFunction';

    return q;
  }
}

module.exports = {
  FunctionDef
};
