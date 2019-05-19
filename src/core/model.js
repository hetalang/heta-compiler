const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record, Assignment } = require('./record');
const { Species } = require('./species');
const { Process } = require('./process');
const { IndexedHetaError } = require('../heta-error');

class Model extends _Simple {
  constructor(q = {}){
    super(q);
    this.population = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Model.isValid(q);
    super.merge(q, skipChecking);

    if(q && q.method) this.method = q.method;

    return this;
  }
  get className(){
    return 'Model';
  }
  static get schemaName(){
    return 'ModelP';
  }
  collectChildren(){
    return [...this._storage]
      .filter((x) => x[1].space===this.id)
      .map((x) => x[1]);
  }
  getById(id){
    return this.population
      .find((scoped) => scoped.id===id);
  }
  selectByInstance(constructor){
    return this.population
      .filter((x) => (x instanceof constructor));
  }
  selectByClassName(className){
    //return this.population
    //  .filter((x) => x.className===className);
    return this.collectChildren()
      .filter((x) => x.className===className);
  }
  selectRecordsByScope(scope){
    return this.selectByInstance(Record)
      .filter((record) => _.has(record, 'assignments.' + scope));
  }
  getChildrenIds(includingVirtual=false){
    return this.population
      .filter((scoped) => !scoped.virtual || includingVirtual)
      .map((scoped) => scoped.id);
  }
  populate(){
    // add population
    this.population = this.collectChildren();
    // collect all deps, possibly helpfull for diagnostics
    let deps = _.chain(this.selectByInstance(Record)) // get list of all dependent values
      .map((record) => {
        return _.map(record.assignments, (assignment) => assignment.size)
          .filter((size) => size.className==='Expression');
      })
      .flatten()
      .map((expression) => expression.exprParsed.getSymbols())
      .flatten()
      .uniq()
      .difference(this.getChildrenIds()) // remove local ids from the list
      .difference(['t']) // remove time
      .value();
      
    // add virtual assignments, search for global if no assignments
    this.selectByInstance(Record)
      .filter((scoped) => scoped.assignments===undefined)
      .forEach((scoped) => {
        let unscoped = this._storage.get(scoped.id); // search the same id in global
        if(unscoped!==undefined && unscoped.className==='Const') {
          scoped.assignments = {
            start_: new Assignment({size: unscoped.clone(), id: scoped.id})
          };
        }
      });
    // add refernced objects for Species
    this.selectByInstance(Species)
      .forEach((species) => {
        if(!species.compartment)
          throw IndexedHetaError(species.indexObj, 'No "compartment" prop for Species.');
        let compartment = this.getById(species.compartment);
        if(compartment!==undefined){
          if(compartment.className!=='Compartment')
            throw IndexedHetaError(species.indexObj, `"compartment" prop reffered not to Compartment but ${compartment.className} for Species.`);
          species.compartmentObj = compartment;
        }
      });

    return this;
  }
  toQ(){
    let res = super.toQ();
    if(this.method) res.method = _.cloneDeep(this.method);

    return res;
  }
  // methods for ode creation
  createMatrixBasedODE(){
    let children = this.collectChildren();
    let res = {
      processes: [], // processes/reactions which change at least one variable
      variables: [], // variables of ode
      matrix: [] // stoichiometry matrix in format [[process num, variable num, stoichiometry], ...]
    };
    // push active processes
    let processNumerator = 0; // numerator of processes
    let variableNumerator = 0; // numerator of variable
    children.filter((x) => {
      return x instanceof Process
        && x.actors.length>0 // process with actors
        && x.actors.some((actor) => !actor._target_.boundary && !actor._target_.implicitBoundary);// true if there is at least non boundary target
    }).forEach((process) => {
      process.num = processNumerator++;
      res.processes.push(process);
    });
    // push non boundary ode variables which are mentioned in processes
    children.filter((x) => {
      return x instanceof Record
        && !x.boundary
        && !x.implicitBoundary
        && x.backReferences.length>0;
    }).forEach((record) => {
      record.num = variableNumerator++;
      res.variables.push(record);
    });

    // create matrix
    res.processes.forEach((process) => {
      process.actors.filter((actor) => {
        return !actor._target_.boundary
          && !actor._target_.implicitBoundary;
      }).forEach((actor) => {
        res.matrix.push([process.num, actor._target_.num, actor.stoichiometry]);
      });
    });

    // push virtual processes and variables with ode_.increment
    children.filter((x) => {
      return x instanceof Record
        && _.get(x, 'assignments.ode_.increment', false);
    }).forEach((record) => {
      // create process for the record
      // virtual process existed only in res.processes array
      let process = new Process({id: `${record.id}_rate_`, space: record.space})
        .merge({
          actors: [
            {target: record.id, stoichiometry: 1} // add record as actor but without backReferences
          ],
          assignments: {
            ode_: new Assignment({size: record.assignments.ode_.size}) // copy size from record, increment = false
          }
        });
      process.actors[0]._target_ = record; // force setting of target object
      process.num = processNumerator++;
      process.isVirtual = true;
      res.processes.push(process);

      // push process with ode_.increment to variables array
      record.num = variableNumerator++;
      res.variables.push(record);

      // set stoichiometry in matrix
      res.matrix.push([process.num, record.num, 1]);
    });

    return res;
  }
}

module.exports = {
  Model
};
