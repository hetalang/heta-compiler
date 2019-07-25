const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record } = require('./record');
const { Species } = require('./species');
// const { Process } = require('./process');
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

    // add virtual assignments, search for global if no assignments
    this.selectByInstance(Record)
      .filter((scoped) => scoped.assignments===undefined)
      .forEach((scoped) => {
        let unscoped = this._storage.get(scoped.id); // search the same id in global
        if(unscoped!==undefined && unscoped.className==='Const') {
          scoped.assignments = {
            //start_: new Assignment({size: unscoped.clone(), id: scoped.id})
            start_: unscoped.clone()
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
}

module.exports = {
  Model
};
