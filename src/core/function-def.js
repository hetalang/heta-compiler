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
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = FunctionDef.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.arguments) {
      this.arguments = q.arguments;
    } else {
      this.arguments = [];
    }
    
    if (q.math) {
      try {
        let expr = Expression.fromString(q.math);
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
    }
  }
  get className(){
    return 'FunctionDef';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  _toQ(options = {}){
    let q = super._toQ(options);

    if (this.arguments && this.arguments.length > 0) {
      q.arguments = this.arguments.map((x) => x);
    }
    if (this.math) {
      q.math = this.math.toString(options);
    }

    return q;
  }
  toQ(options = {}){
    let q = this._toQ(options);
    q.action = 'defineFunction';

    return q;
  }
}

module.exports = {
  FunctionDef
};
