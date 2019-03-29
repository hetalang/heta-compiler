const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record } = require('./record');
const { Switcher } = require('./switcher');

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
        return _.map(record.assignments, (assignment) => assignment)
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
          assignments: {}
        });
        virtualRecord.assignments.start_ = unscoped.clone(); // maybe clone is not required
        virtualRecord.virtual = true; // flat means it is generated but not set by user
        this.population.push(virtualRecord);
      }
    });
    // add virtual assignments, search for global if no assignments
    this.selectByInstance(Record)
      .filter((scoped) => scoped.assignments===undefined)
      .forEach((scoped) => {
        let unscoped = this._storage.get(scoped.id); // search the same id in global
        if(unscoped!==undefined && unscoped.className==='Const') {
          let globalConst = unscoped.clone(); // maybe clone is not required
          scoped.assignments = {start_: globalConst};
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
