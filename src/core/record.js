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
    let validationLogger = Record.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if (q.assignments) { // add new assignments from q
        _.forOwn(q.assignments, (x, key) => {
          if (typeof x === 'string' || typeof x === 'number' || 'expr' in x) {
            try { // this is for the cases of wrong size structure
              _.set(this.assignments, key, Expression.fromString(x));
            } catch (e) {
              let msg = this.index + ' '+ e.message + ` "${x.toString()}"`;
              this.logger.error(msg, 'ValidationError');
            }
          } else {
            throw new Error('Wrong expression argument.'); // if code is OK never throws
          }
        });
      }
  
      if(q.boundary !== undefined) this.boundary = q.boundary;
    }
    
    return this;
  }
  /** change referencies inside expression */
  updateReferences(q = {}){
    super.updateReferences(q);
    
    // check math expression refs
    if(this.assignments){
      _.each(this.assignments, (mathExpr, key) => {
        let parsed = mathExpr.exprParsed;
        parsed.traverse((node /*, path, parent*/) => {
          if(node.type==='SymbolNode'){ // transform only SymbolNode
            let oldRef = _.get(node, 'name');
            let newRef = _.get(
              q.rename, 
              oldRef, 
              [q.prefix, oldRef, q.suffix].join('') // default behaviour
            );

            _.set(node, 'name', newRef);
          }
        });
      });
    }
  }
  bind(namespace){
    let logger = super.bind(namespace);

    // check initialization
    let hasInit = _.get(this, 'assignments.start_') !== undefined
      || _.get(this, 'assignments.ode_') !== undefined;
    if (!hasInit) {
      let msg = `Record "${this.index}" is not initialized. You must set "start_" or "ode_" for the record or use abstract namespace.`
      logger.error(msg, 'BindingError');
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
            logger.error(msg, 'BindingError');
          }else if(!target.instanceOf('Const') && !target.instanceOf('Record')){
            let msg = `Component "${id}" is not a Const or Record class as expected in expression: `
              + `${this.index} [${key}]= ${mathExpr.toString()};`;
            logger.error(msg, 'BindingError');
          }
        });
    });

    return logger;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (_.size(this.assignments)) {
      res.assignments = _.mapValues(this.assignments, (x) => x.toString(options));
    }
    if (this.boundary) {
      res.boundary = this.boundary;
    }
    if (this.units) {
      res.units = this.units;
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
    if(typeof context !== 'string')
      throw new TypeError('context must be of string type.');

    let assignment = _.get(this, 'assignments.' + context);
    if (assignment !== undefined) {
      let deps = assignment
        .exprParsed
        .getSymbols();
      _.pull(deps, 't', 'e', 'pi'); // remove t from dependence
      return deps;
    } else if(this.isRule) {
      let deps = this.assignments.ode_
        .exprParsed
        .getSymbols();
      _.pull(deps, 't', 'e', 'pi');
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
  references(){
    let classSpecificRefs = _.chain(this.assignments)
      .map((expression) => {
        let deps = expression.exprParsed.getSymbols();
        _.pull(deps, 't', 'e', 'pi');
        
        return deps;
      })
      .flatten()
      .value();

    return super.references()
      .concat(classSpecificRefs);
  }
}

module.exports = {
  Record
};
