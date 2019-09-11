const { _Scoped } = require('./_scoped');
const { Expression } = require('./expression');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');
// const math = require('mathjs');
const { IndexedHetaError } = require('../heta-error');

class Record extends _Scoped {
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
            throw new IndexedHetaError(q, e.message);
          }
        }else{
          throw new Error('Wrong expression argument.');// if code is OK never throws
        }
      });
      this.assignments = _.assign(this.assignments, newAssignments); // maybe clone is required
    }

    if(q && q.boundary) this.boundary = q.boundary;
    if(q && q.units!==undefined) this.units = q.units;

    return this;
  }
  static get schemaName(){
    return 'RecordP';
  }
  get className(){
    return 'Record';
  }
  get isRecord(){
    return true;
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
  SBMLUnits(){
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
  get implicitBoundary(){
    return _.has(this, 'assignments.ode_'); // this is rule
  }
  // works properly only after setReferences()
  get isDynamic(){
    return !this.boundary
      && !this.implicitBoundary
      && this.backReferences.length > 0;
  }
  dependOnIds(scope){
    if(typeof scope !== 'string')
      throw new TypeError('scope must be of string type.');
    if(this.className==='Species' && !this.isAmount && this.compartment===undefined)
      throw new Error('compartment should be set for Species when isAmount=false');

    let exprPath = 'assignments.' + scope;
    if(_.has(this, exprPath)){
      let deps = this.assignments[scope]
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
