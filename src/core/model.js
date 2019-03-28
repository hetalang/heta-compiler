const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record } = require('./record');
const { Switcher } = require('./switcher');

class Model extends _Simple {
  constructor(ind){
    super(ind);
    this._populated = false;
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
  populate(){
    this._populated = true;
    let switchers = this._storage
      .getByInstance(Switcher, this.id)
      .forEach((sw) => sw.switcherSpecificEl = []);

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
