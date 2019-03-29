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
  populate(){
    // add population
    this.population = this.collectChildren();
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
