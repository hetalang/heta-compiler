const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Record } = require('./record');

class Model extends _Simple {
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
  populate(){
    this
      .getQuantities()
      .forEach((record, i, array) => {
        // check compartmentRef in Species
        record.populate(array);
        // check targetRef in Reactions

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
