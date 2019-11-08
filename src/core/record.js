const { _Component } = require('./_component');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');
const { ValidationError, BindingError } = require('../heta-error');

class Record extends _Component {
  constructor(q = {}){
    super(q);
    this.backReferences = []; // storing in format {process: r1, _process_: {}, stoichiometry: -1}
  }
  merge(q, skipChecking){
    if(!skipChecking) Record.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.assignments){ // add new assignments from q
      let newAssignments = _.mapValues(q.assignments, (x) => {
        if(typeof x === 'string' || typeof x === 'number' || 'expr' in x){
          try{ // this is for the cases of wrong size structure
            return new Expression(x);
          }catch(e){
            throw new ValidationError(q, [], e.message + `: "${x.expr}"`);
          }
        }else{
          throw new Error('Wrong expression argument.'); // if code is OK never throws
        }
      });
      this.assignments = _.assign(this.assignments, newAssignments); // maybe clone is required
    }

    if(q && q.boundary) this.boundary = q.boundary;
    if(q && q.units!==undefined) this.units = q.units;

    return this;
  }
  bind(container, skipErrors = false){
    super.bind(container, skipErrors);

    if(!container) throw new TypeError('"container" argument should be set.');
    let messages = [];
    
    // check math expression refs
    if(this.assignments){
      _.each(this.assignments, (mathExpr, key) => {
        this
          .dependOn(key)
          .forEach((id) => {
            let target = container.softSelect({
              id: id, 
              space: this.space
            });

            if(!target){
              messages.push(`Component "${id}" is not found in space "${this.space}" or in global as expected in expression: `
                    + `${this.index} [${key}]= ${mathExpr.expr};`);
            }else if(!target.instanceOf('Const') && !target.instanceOf('Record')){
              messages.push(`Component "${id}" is not a Const or Record class as expected in expression: `
                + `${this.index} [${key}]= ${mathExpr.expr};`);
            }else{
              if(this.space !== target.space){ // if local -> global
                // clone component with another space
                let q = target.toQ();
                let selectedClass = container.classes[q.class];
                target = (new selectedClass({id: target.id, space: this.space})).merge(q);
                target.isVirtual = true;
                container.storage.set(target.index, target);
                // pop dependencies of virtual recursively
                target.bind(container, skipErrors);
              }
            }
          });
      });
    }

    if(messages.length>0 && !skipErrors)
      throw new BindingError(this.index, messages, 'References error in expressions:');
  }
  toQ(){
    let res = super.toQ();
    if(this.assignments){
      res.assignments = _.mapValues(this.assignments, (x) => x.toQ());
    }
    if(this.boundary){
      res.boundary = this.boundary;
    }
    if(this.units){
      res.units = this.units;
    }
    return res;
  }
  unitsSBML(){
    return this.units;
  }
  unitsHash(){
    if(this.units){
      return uParser
        .parse(this.units)
        .toHash();
    }else{
      return;
    }
  }
  // XXX: temporal solution
  unitsSimbio(){
    return this.units;
  }
  get implicitBoundary(){
    return _.has(this, 'assignments.ode_'); // this is rule
  }
  // works properly only after populate()
  get isDynamic(){
    return !this.boundary
      && !this.implicitBoundary
      && this.backReferences.length > 0;
  }
  dependOn(context){
    if(typeof context !== 'string')
      throw new TypeError('context must be of string type.');
    if(this.className==='Species' && !this.isAmount && this.compartment===undefined)
      throw new BindingError(this.index, [], 'compartment should be set for Species when isAmount=false');

    let exprPath = 'assignments.' + context;
    if(_.has(this, exprPath)){
      let deps = this.assignments[context]
        .exprParsed
        .getSymbols();
      _.pull(deps, 't'); // remove t from dependence
      if(this.className==='Species' && !this.isAmount) 
        deps.push(this.compartment);
      return deps;
    }else{
      return undefined;
    }
  }
}

module.exports = {
  Record
};
