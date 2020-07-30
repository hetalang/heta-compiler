const { _Size } = require('./_size');
const { Expression } = require('./expression');
const _ = require('lodash');

/*
  record1 @Record {
    assignments: { start_: x*y },
    boundary: true
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
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Record.isValid(q, logger);

    if (valid) {
      if (q.assignments) { // add new assignments from q
        _.forOwn(q.assignments, (x, key) => {
          if (typeof x === 'string' || typeof x === 'number') {
            try { // this is for the cases of wrong ExprString structure
              let expr = Expression.fromString(x);
              if (!expr.hasBooleanResult()) {
                this.assignments[key] = expr;
              } else {
                let msg = `Record assignments "${this.index}" should be a numeric expression.`;
                logger && logger.error(msg, {type: 'ValidationError', space: this.space});
              }
            } catch (e) {
              let msg = this.index + ' '+ e.message + ` "${x.toString()}"`;
              logger && logger.error(msg, {type: 'ValidationError', space: this.space});
            }
          } else {
            throw new Error('Wrong expression argument.'); // if code is OK never throws
          }
        });
      }
  
      if (q.boundary !== undefined) this.boundary = q.boundary;
    }
    
    return this;
  }
  clone(){
    let clonedComponent = super.clone();
    if (_.size(this.assignments) > 0)
      clonedComponent.assignments = _.mapValues(this.assignments, (expr) => expr.clone());
    if (typeof this.boundary !== undefined)
      clonedComponent.boundary = this.boundary;
      
    return clonedComponent;
  }
  /*
    change referencies inside expression
  */
  updateReferences(q = {}){
    super.updateReferences(q);
    
    // check math expression refs
    _.each(this.assignments, (mathExpr) => mathExpr.updateReferences(q));
  }
  bind(namespace){
    super.bind(namespace);
    let logger = this.namespace.container.logger;

    // check initialization
    let hasInit = _.get(this, 'assignments.start_') !== undefined
      || _.get(this, 'assignments.ode_') !== undefined;
    if (!hasInit) {
      let msg = `Record "${this.index}" is not initialized. You must set "start_" or "ode_" for the record or use abstract namespace.`
      logger.error(msg, {type: 'BindingError', space: this.space});
    }
    
    // check math expression refs
    _.each(this.assignments, (mathExpr, key) => {
      this
        .dependOn(key)
        .forEach((id) => {
          let target = namespace.get(id);

          if(!target){
            let msg = `Component "${id}" is not found in space "${this.space}" as expected in expression: `
                  + `${this.index} [${key}]= ${mathExpr.toString()};`;
            logger.error(msg, {type: 'BindingError', space: this.space});
          }else if(!target.instanceOf('Const') && !target.instanceOf('Record')){
            let msg = `Component "${id}" is not a Const or Record class as expected in expression: `
              + `${this.index} [${key}]= ${mathExpr.toString()};`;
            logger.error(msg, {type: 'BindingError', space: this.space});
          }
        });
    });
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (_.size(this.assignments)) {
      res.assignments = _.mapValues(this.assignments, (x) => x.toString(options));
    }
    if (this.boundary) {
      res.boundary = this.boundary;
    }

    return res;
  }
  get isRule(){
    return _.has(this, 'assignments.ode_'); // this is rule
  }
  // works properly only after knit()
  get isDynamic(){
    return !this.boundary
      && !this.isRule
      && this.backReferences.length > 0;
  }
  /*
    returns array of ids which depends on
    t (time), e, pi are not included
    if no expression returns dependence from ode
  */
  dependOn(context){
    if (typeof context !== 'string')
      throw new TypeError('context must be of string type.');

    let assignment = _.get(this, 'assignments.' + context);
    if (this.isRule) {
      let deps = this.assignments.ode_ // top priority in context
        .exprParsed
        .getSymbols();
      _.pull(deps, 't', 'e', 'pi');
      return deps;
    } else if (assignment !== undefined) {
      let deps = assignment
        .exprParsed
        .getSymbols();
      _.pull(deps, 't', 'e', 'pi'); // remove t from dependence
      return deps;
    } else {
      return [];
    }
  }
  // return Expression based on context
  getAssignment(context){
    if(typeof context !== 'string')
      throw new TypeError('context argument must be of string type.');
    
    let assignment = _.get(this, 'assignments.' + context);
    //if (assignment !== undefined) {
    //  return assignment;
    //} else {
    //  return _.get(this, 'assignments.ode_');
    //}
    return assignment;
  }
  _references(){
    let classSpecificRefs = _.chain(this.assignments)
      .map((expression) => {
        let deps = expression.exprParsed.getSymbols();
        _.pull(deps, 't', 'e', 'pi');
        
        return deps;
      })
      .flatten()
      .value();

    return super._references()
      .concat(classSpecificRefs);
  }
}

module.exports = {
  Record
};
