const { _Component } = require('./_component');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');
const { ValidationError, BindingError } = require('../heta-error');

class Record extends _Component {
  constructor(){
    super();
    this.backReferences = []; // storing in format {process: r1, _process_: {}, stoichiometry: -1}
  }
  merge(q, skipChecking){
    if(!skipChecking) Record.isValid(q);
    super.merge(q, skipChecking);

    if(q.assignments){ // add new assignments from q
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

    if(q.units!==undefined){
      //this.units = q.units;
      this.unitsParsed = uParser.parse(q.units);
    }

    if(q && q.boundary) this.boundary = q.boundary;

    return this;
  }
  get units(){
    if(this.unitsParsed!==undefined){
      return this.unitsParsed.toString();
    }else{
      return undefined;
    }
  }
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
            let target = container.select({
              id: id, 
              space: this.space
            });

            if(!target){
              messages.push(`Component "${id}" is not found in space "${this.space}" as expected in expression: `
                    + `${this.index} [${key}]= ${mathExpr.expr};`);
            }else if(!target.instanceOf('Const') && !target.instanceOf('Record')){
              messages.push(`Component "${id}" is not a Const or Record class as expected in expression: `
                + `${this.index} [${key}]= ${mathExpr.expr};`);
            }
          });
      });
    }

    if(messages.length>0 && !skipErrors)
      throw new BindingError(this.index, messages, 'References error in expressions:');
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.assignments){
      res.assignments = _.mapValues(this.assignments, (x) => x.toQ(options));
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
    return this.unitsParsed;
  }
  unitsHash(){
    if(this.unitsParsed!==undefined){
      return this.unitsParsed.toHash();
    }else{
      return undefined;
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
