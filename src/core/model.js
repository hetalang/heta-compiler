const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record, Assignment } = require('./record');
const { Species } = require('./species');
const expect = require('chai').expect;

class Model extends _Simple {
  constructor(ind){
    super(ind);
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
    return this.population
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
    // collect all deps
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
    deps.forEach((id) => { // select deps mentioned in global but not in space
      let unscoped = this._storage.get(id);
      if(unscoped!==undefined && unscoped.className==='Const') {
        let virtualRecord = new Record({id: id, space: this.id}).merge({
          title: 'Generated virtual Record',
          assignments: {},
          units: unscoped.units // use unit from Const
        });
        virtualRecord.assignments.start_ = new Assignment({size: unscoped.clone(), id: id});
        virtualRecord.virtual = true; // virtual means it is generated but not set by user
        this.population.push(virtualRecord);
      }
    });
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
        expect(species).to.have.property('compartment');
        let compartment = this.getById(species.compartment);
        if(compartment!==undefined){
          expect(compartment).to.have.property('className', 'Compartment');
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
