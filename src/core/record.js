const { _Size } = require('./_size');
const { Expression } = require('./expression');

/*
  record1 @Record {
    assignments: { start_: x*y },
    boundary: true,
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
    let logger = this.namespace?.container?.logger;
    let valid = Record.isValid(q, logger);

    if (valid) {
      if (q.assignments) { // add new assignments from q
        Object.entries(q.assignments).forEach(([key, x]) => {
          if (typeof x === 'string' || typeof x === 'number') {
            try { // this is for the cases of wrong ExprString structure
              let expr = Expression.fromString(x);
              expr._logger = logger;
              if (!expr.hasBooleanResult()) {
                this.assignments[key] = expr;
              } else {
                let msg = `Record assignments "${this.index}" should be a numeric expression.`;
                logger && logger.error(msg, {type: 'ValidationError', space: this.space});
              }
            } catch (e) {
              let msg = this.index + ': '+ e.message + ` in "${x.toString()}"`;
              logger && logger.error(msg, {type: 'ValidationError', space: this.space});
            }
          } else {
            throw new Error('Wrong expression argument.'); // if code is OK never throws
          }
        });
      }
  
      if (q.boundary !== undefined) this.boundary = q.boundary;
      if (q.output !== undefined) this.output = q.output;
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
    if (typeof this.boundary !== undefined)
      clonedComponent.boundary = this.boundary;
    if (typeof this.output !== undefined)
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
    let logger = this.namespace.container.logger;

    // check initialization
    let hasInit = this.assignments?.start_ !== undefined
      || this.assignments?.ode_ !== undefined;
    if (!hasInit) {
      let msg = `Record "${this.index}" is not initialized. You must set "start_" or "ode_" for the record or use abstract namespace.`
      logger.error(msg, {type: 'BindingError', space: this.space});
    }
    
    // check math expression refs
    for (const key in this.assignments) {
      let mathExpr = this.assignments[key];
      mathExpr.dependOnNodes()
        .forEach((node) => {
          let target = namespace.get(node.name);
          if (!target) {
            let msg = `Component "${node.name}" is not found in space "${this.space}" as expected in expression: `
                  + `${this.index} [${key}]= ${mathExpr.toString()};`;
            logger.error(msg, {type: 'BindingError', space: this.space});
            this.errored = true;
          } else if (!target.instanceOf('_Size')) {
            let msg = `Component "${node.name}" is not a Const/Record/TimeScale class as expected in expression: `
              + `${this.index} [${key}]= ${mathExpr.toString()};`;
            logger.error(msg, {type: 'BindingError', space: this.space});
            this.errored = true;
          } else {
            node.nameObj = target;
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
    let logger = this.namespace.container.logger;

    let leftSideUnit = this.unitsParsed;
    if (typeof leftSideUnit === 'undefined') {
      logger.warn(`No units set for "${this.index}"`);
    }
    for (const scope in this.assignments) {
      let rightSideExpr = this.assignments[scope];
      if (typeof rightSideExpr.num === 'undefined') { // skip numbers
        let rightSideUnit = rightSideExpr.calcUnit(this);
        if (typeof rightSideUnit === 'undefined') {
          logger.warn(`Cannot calculate right side units in "${this.index}" for scope "${scope}".`);
        } else if (leftSideUnit && !leftSideUnit.equal(rightSideUnit, true)) {
          let leftUnitString = leftSideUnit.toString();
          let rightUnitString = rightSideUnit.simplify().toString();
          logger.warn(`Units inconsistency in "${this.index}" for scope "${scope}". Left: "${leftUnitString}". Right: "${rightUnitString}"`);
        }
      }
    }
  }
  _references(){
    let classSpecificRefs = Object.entries(this.assignments)
      .map(([key, expression]) => expression.dependOn())
      .flat(1);

    return super._references()
      .concat(classSpecificRefs);
  }
}

module.exports = {
  Record
};
