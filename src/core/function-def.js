const { Top } = require('./top');
const { ajv } = require('../ajv');
const { Expression } = require('./expression');
const HetaLevelError = require('../heta-level-error');

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
  merge(q = {}) {
    super.merge(q);

    // check arguments here
    let logger = this._container?.logger;
    let valid = FunctionDef.isValid(q, logger);
    if (!valid) {
      this.errored = true;
      return this;
    }

    // undefined arguments means it can vary (for core elements)
    if (!!q.arguments) {
      this.arguments = q.arguments;
    } else if (!this.isCore) {
      logger?.error(
        `Function "${this.id}" requires an "arguments" list.`,
        {diagnosticCode: 'MISSING_FUNCTION_ARGUMENTS', id: this.id, path: 'arguments'}
      );
      this.errored = true;
    }
    
    if (!!q.math) {
      try {
        var expr = Expression.fromString(q.math);
        if (!expr.hasBooleanResult()) {
          this.math = expr;
        } else {
          logger?.error(
            `Function math "${this.id}" should be a numeric expression.`, 
            {diagnosticCode: 'EXPECTED_NUMERIC_EXPRESSION', id: this.id, expression: q.math, path: 'math'}
          );
          this.errored = true;
        }
      } catch (error) {
        if (!(error instanceof HetaLevelError)) throw error;
        let msg = this.id + ': '+ error.message + ` in "${q.math.toString()}"`;
        logger?.error(msg, {...error.opt, id: this.id, expression: q.math, path: 'math'});
        this.errored = true;
        return; // BRAKE
      }

      // check that identifiers in `math` correspond to `arguments`
      let lostVariables = expr.dependOn()
        .filter((v) => this.arguments?.indexOf(v) === -1);
      if (lostVariables.length > 0) {
        logger?.error(
          `Function "${this.id}" uses variables not listed in its arguments: ${lostVariables.join(', ')}.`,
          {diagnosticCode: 'UNDECLARED_FUNCTION_VARIABLE', id: this.id, path: 'math', expression: q.math, variables: lostVariables}
        );
        this.errored = true;
      }
    } else if (!this.isCore) {
      logger?.error(
        `Function "${this.id}" requires a "math" expression.`,
        {diagnosticCode: 'MISSING_FUNCTION_EXPRESSION', id: this.id, path: 'math'}
      );
      this.errored = true;
    }

    return this;
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

    // find and set reference to other functions
    this.math?.functionList(false).forEach((functionNode) => {
      // find target functionDef
      let target = functionDefStorage.get(functionNode.fn.name);
      if (!target) {
        let msg = `FunctionDef "${functionNode.fn.name}" is not found as expected here: `
        + `${this.index} { math: ${this.math} };`;
        logger?.error(
          msg,
          {diagnosticCode: 'UNKNOWN_FUNCTION', id: this.id, path: 'math', functionId: functionNode.fn.name, expression: this.math.toString()}
        );
      } else {
        functionNode.fnObj = target; // used for units checking
      }

      // check arguments in functionNode
      if (target?.arguments && functionNode.args.length < target.arguments.length) {
        logger?.error(
          `FunctionDef "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`, 
          {diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: functionNode.fn.name, requiredArguments: target.arguments.length, providedArguments: functionNode.args.length, id: this.id, space: this.space, path: 'math'}
        );
      }
    });
  }
  toQ(options = {}) {
    let q = super.toQ(options);
    q.action = 'defineFunction';

    if (this.arguments && this.arguments.length > 0) {
      q.arguments = this.arguments.map((x) => x);
    }
    if (this.math) {
      q.math = this.math.toString(options);
    }

    return q;
  }
}

module.exports = {
  FunctionDef
};
