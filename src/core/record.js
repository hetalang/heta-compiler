const { _Size } = require('./_size');
const { Expression } = require('./expression');
const { ajv } = require('../ajv');
const HetaLevelError = require('../heta-level-error');

const schema = {
  type: 'object',
  properties: {
    assignments: {
      '$ref': '#/definitions/AssignmentDict'
    },
    boundary: {oneOf: [
      {
        enum: [true, false, 1, 0], default: false,
        description: 'If it is true the record cannot be changed by any process, only by expression in assignments.'
      },
      { type: 'null' }
    ]},
    ss: {oneOf: [
      {
        enum: [true, false, 1, 0],
        description: 'Steady-State variable'
      },
      { type: 'null' }
    ]},
    output: {oneOf: [
      {
        enum: [true, false, 1, 0],
        description: 'Should be the record listed as an output.'
      },
      { type: 'null' }
    ]}
  },
  definitions: {
    AssignmentDict: {
      description: 'Stores initializations as key/value dictionary. Key is switcher when to use. Key is one of Switcher id.',
      type: 'object',
      propertyNames: { '$ref': '#/definitions/ID' },
      additionalProperties: {
        anyOf: [
          { type: 'number'},
          { type: 'null' },
          { '$ref': '#/definitions/ExprString' }
        ],
        errorMessage: 'should be a string, number or null.'
      },
      example: {
        start_: { expr: 1.2 },
        ode_: { expr: 'x * y' },
        evt1: { expr: 'z + 1.2' }
      }
    },
    ID: {
      description: 'First character is letter, others are letter, digit or lodash.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    },
    ExprString: {
      description: 'Expression as string. Currently pattern does not analyze expressions.',
      type: 'string',
      minLength: 1,
      pattern: '[a-zA-Z0-9. -+/*^()]*$',
      errorMessage: {
        minLength: 'should not be empty string.'
      }
    }
  }
};

/*
  record1 @Record {
    assignments: { start_: x*y },
    boundary: true,
    ss:false,
    output: true
  };
*/
class Record extends _Size {
  constructor(isCore = false){
    super(isCore);
    this.backReferences = []; // storing in format {process: r1, _process_: {}, stoichiometry: -1}
    this.assignments = {};
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Record.isValid(q, logger);

    if (valid) {
      if (q.assignments) { // add new assignments from q
        Object.entries(q.assignments).forEach(([key, x]) => {
          if (typeof x === 'string' || typeof x === 'number') {
            try { // this is for the cases of wrong ExprString structure
              let expr = Expression.fromString(x);
              if (!expr.hasBooleanResult()) {
                this.assignments[key] = expr;
              } else {
                logger?.error(
                  `Record assignments "${this.index}" should be a numeric expression.`, 
                  {diagnosticCode: 'EXPECTED_NUMERIC_EXPRESSION', space: this.space, id: this.id, expression: x, path: `assignments.${key}`}
                );
              }
            } catch (error) {
              if (!(error instanceof HetaLevelError)) throw error;
              let msg = this.index + ': '+ error.message + ` in "${x.toString()}"`;
              logger?.error(msg, {...error.opt, space: this.space, id: this.id, path: `assignments.${key}`});
            }
          } else if (x === null) {
            delete this.assignments[key];
          } else {
            throw new Error('Wrong expression argument.'); // if code is OK never throws
          }
        });
      }
  
      if (q.boundary === null) {
        delete this.boundary;
      } else if (q.boundary !== undefined) {
        this.boundary = !!q.boundary;
      }
      if (q.ss === null) {
        delete this.ss;
      } else if (q.ss !== undefined) {
        this.ss = !!q.ss;
      }
      if (q.output === null) {
        delete this.output;
      } else if (q.output !== undefined) {
        this.output = !!q.output;
      } 
    }
    
    return this;
  }
  get className() {
    return 'Record';
  }
  clone(){
    let clonedComponent = super.clone();
    clonedComponent.assignments = {};
    Object.entries(this.assignments).forEach(([key, expr]) => {
      clonedComponent.assignments[key] = expr.clone();
    });
    if (typeof this.boundary !== 'undefined')
      clonedComponent.boundary = this.boundary;
    if (typeof this.ss !== 'undefined')
      clonedComponent.ss = this.ss;
    if (typeof this.output !== 'undefined')
      clonedComponent.output = this.output;
      
    return clonedComponent;
  }
  /*
    change references inside expression
  */
  updateReferences(q = {}){
    super.updateReferences(q);
    
    // check math expression refs
    Object.values(this.assignments)
      .forEach((mathExpr) => mathExpr.updateReferences(q));
  }
  bind(namespace){
    super.bind(namespace);
    let {logger, functionDefStorage} = this._container;

    // check initialization
    let hasInit = this.assignments?.start_ !== undefined
      || this.assignments?.ode_ !== undefined;
    if (!hasInit) {
      logger.error(
        `Record "${this.index}" requires a "start_" or "ode_" assignment in a concrete namespace.`,
        {diagnosticCode: 'MISSING_INITIAL_VALUE', space: this.space, id: this.id, path: 'assignments'}
      );
    }

    // check additional context key and corresponding _Switcher
    Object.keys(this.assignments).forEach((key) => {
      if (key !== 'start_' && key !== 'ode_') {
        let switcher = namespace.get(key);
        if (!switcher) {
          logger.warn(
            `Record "${this.index}" has an assignment for Switcher "${key}", but that Switcher was not found.`,
            {diagnosticCode: 'MISSING_ASSIGNMENT_SWITCHER', space: this.space, id: this.id, path: `assignments.${key}`, switcher: key}
          );
        }
      }
    });
    
    // check math expression refs
    for (const key in this.assignments) {
      let mathExpr = this.assignments[key];

      // check references to components
      mathExpr.dependOnNodes().forEach((node) => {
        let target = namespace.get(node.name);
        if (!target) {
          let msg = `Component "${node.name}" is not found in space "${this.space}" as expected in expression: `
                + `${this.index} [${key}]= ${mathExpr.toString()};`;
          logger.error(
            msg,
            {diagnosticCode: 'MISSING_REFERENCE', space: this.space, id: this.id, path: `assignments.${key}`, reference: node.name, expression: mathExpr.toString()}
          );
          this.errored = true;
        } else if (!target.instanceOf('_Size')) {
          let msg = `Component "${node.name}" is not a Const/Record/TimeScale class as expected in expression: `
            + `${this.index} [${key}]= ${mathExpr.toString()};`;
          logger.error(
            msg,
            {diagnosticCode: 'WRONG_REFERENCE_TYPE', space: this.space, id: this.id, path: `assignments.${key}`, reference: node.name, expression: mathExpr.toString(), expectedClass: '_Size', actualClass: target.className}
          );
          this.errored = true;
        } else {
          node.nameObj = target;
        }
      });

      // check references to function definitions
      mathExpr.functionList(false).forEach((functionNode) => {
        // find target functionDef
        let target = functionDefStorage.get(functionNode.fn.name);
        if (!target) {
          logger.error(
            `Function "${functionNode.fn.name}" is not defined in assignment "${key}" of "${this.index}": ${mathExpr.toString()}.`,
            {diagnosticCode: 'UNKNOWN_FUNCTION', space: this.space, id: this.id, path: `assignments.${key}`, functionId: functionNode.fn.name, expression: mathExpr.toString()}
          );
        } else {
          // used in units checking and expression substitution, but seems is not the best solution
          functionNode.fnObj = target;
        }

        // check arguments in functionNode
        if (target?.arguments && functionNode.args.length < target.arguments.length) {
          logger?.error(
            `Record "${this.id}": Not enough arguments inside function ${functionNode}, required ${target.arguments.length}`, 
            {diagnosticCode: 'FUNCTION_ARGUMENT_COUNT', functionId: functionNode.fn.name, requiredArguments: target.arguments.length, providedArguments: functionNode.args.length, id: this.id, space: this.space, path: `assignments.${key}`},
          );
        }
      });
    }
  }
  toQ(options = {}){
    let res = super.toQ(options);
    res.assignments = {};
    Object.entries(this.assignments).forEach(([key, value]) => {
      res.assignments[key] = value.toString();
    });
    if (this.boundary) {
      res.boundary = this.boundary;
    }
    this.ss && (res.ss = this.ss);
    if (this.output) {
      res.output = this.output;
    }

    return res;
  }
  /**
   * Check if a record is calculated based on rule (repeated assignment) in each time point.
   * 
   * When record is of the rule type only `assignments.ode_` property is working. 
   * 
   * @getter
   */
  get isRule(){
    return this.assignments.ode_ !== undefined;
  }
  // check if the record will used as a rule in Julia-like formats
  // this is the same as `isRule` for many Records
  get isExtendedRule(){
    return this.assignments.ode_ !== undefined;
  }
  // works properly only after knit()
  get isDynamic(){
    return !this.boundary
      && !this.isRule
      && this.backReferences.length > 0;
  }
  /*
    returns array of ids which depends on
    e, pi are not included
    if rule returns dependence from ode_ scope
  */
  dependOn(context){
    if (typeof context !== 'string')
      throw new TypeError('context must be of string type.');

    let assignment = this.assignments[context];
    if (this.isRule) {
      return this.assignments['ode_'].dependOn(); // top priority
    } else if (assignment !== undefined) {
      return assignment.dependOn();
    } else {
      return [];
    }
  }
  // return Expression based on context
  getAssignment(context){
    if(typeof context !== 'string')
      throw new TypeError('context argument must be of string type.');
    
    let assignment = this.assignments[context];
    //if (assignment !== undefined) {
    //  return assignment;
    //} else {
    //  return this.assignments?.ode_;
    //}
    return assignment;
  }
  /*
  Check units recursively for mathematical expressions
  Works only for bound records
  */
  checkUnits(){
    let logger = this._container?.logger;

    let leftSideUnit = this.unitsParsed;
    if (typeof leftSideUnit === 'undefined') {
      logger.warn(
        `No units set for "${this.index}"`,
        {diagnosticCode: 'MISSING_UNIT', space: this.space, id: this.id, path: 'units'}
      );
    }
    for (const scope in this.assignments) {
      let rightSideExpr = this.assignments[scope];
      if (typeof rightSideExpr.num === 'undefined') { // skip numbers
        let rightSideUnit = rightSideExpr.calcUnit(this);
        if (typeof rightSideUnit === 'undefined') {
          logger.warn(
            `Cannot calculate units for assignment "${scope}" in "${this.index}".`,
            {diagnosticCode: 'UNIT_CALCULATION_FAILED', space: this.space, id: this.id, path: `assignments.${scope}`, expression: rightSideExpr.toString()}
          );
        } else if (leftSideUnit && !leftSideUnit.equal(rightSideUnit, true)) {
          let leftUnitString = leftSideUnit.toString();
          let rightUnitString = rightSideUnit.simplify().toString();
          logger.warn(
            `Units inconsistency in "${this.index}" for scope "${scope}". Left: "${leftUnitString}". Right: "${rightUnitString}"`,
            {diagnosticCode: 'UNIT_MISMATCH', space: this.space, id: this.id, path: `assignments.${scope}`, expression: rightSideExpr.toString(), unitExpression: `${leftUnitString} vs ${rightUnitString}`}
          );
        }
      }
    }
  }
  _references() {
    let classSpecificRefs = Object.entries(this.assignments)
      .map(([key, expression]) => expression.dependOn())
      .flat(1);

    return super._references().concat(classSpecificRefs);
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

module.exports = {
  Record
};
