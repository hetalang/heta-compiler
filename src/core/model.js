const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record } = require('./record');
const { Switcher } = require('./switcher');

class Model extends _Simple {
  constructor(ind){
    super(ind);
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
  getChildren(){
    return [...this._storage]
      .filter((x) => x[1].space===this.id)
      .map((x) => x[1]);
  }
  getByInstance(constructor){
    return _.chain([...this._storage])
      .filter((x) => (x[1] instanceof constructor) && x[1].space===this.id)
      .map((x) => x[1])
      .value();
  }
  getByClassName(className){
    return _.chain([...this._storage])
      .filter((x) => (x[1].className===className) && x[1].space===this.id)
      .map((x) => x[1])
      .value();
  }
  populate(){
    // set scopes
    this._scopes = { start_: [], ode_: [] };
    this
      .getByInstance(Switcher)
      .forEach((sw) => this._scopes[sw.id] = []);
    // populate _scopes
    _.forOwn(this._scopes, (value, scope) => {
      this.getByInstance(Record)
        .filter((scoped) => _.has(scoped, `assignments.${scope}`))
        .forEach((record) => {
          value.push({symbol: record.id, size: record.assignments[scope]});
        });
    });
    // add virtual assignments, search for global if no assignments
    this.getByInstance(Record)
      .filter((scoped) => scoped.assignments===undefined)
      .forEach((scoped) => {
        let unscoped = this._storage.get(scoped.id); // search the same id in global
        if(unscoped!==undefined && unscoped.className==='Const') {
          let globalConst = _.cloneDeep(unscoped);
          globalConst.const = true;
          globalConst.virtual = true;
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
