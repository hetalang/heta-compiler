const _ = require('lodash');
const { _Scoped } = require('./_scoped');
const { Compartment } = require('./compartment');
const { Species } = require('./species');
const { Reaction } = require('./reaction');
const { Quantity } = require('./quantity');

class Model extends _Scoped {
  constructor(){
    super();
    this.scope = 'default';
    this.type = 'kinetic';
  }
  merge(q, skipChecking){
    if(!skipChecking) Model.isValid(q);
    super.merge(q, skipChecking);
    // this._storage;

    if(q && q.scope) this.scope = q.scope;
    if(q && q.type) this.type = q.type;
    if(q && q.method) this.method = q.method;

    return this;
  }
  get className(){
    return 'Model';
  }
  static get schemaName(){
    return 'ModelP';
  }
  getUniqueUnits(){
    return _.chain(this.getQuantities())
      .filter((quantity) => quantity.variable.units)
      .uniqBy((quantity) => quantity.unitsHash)
      .value();
  }
  getQuantities(){
    return this._storage.filter((component) => {
      return (component instanceof Quantity) && component.space===this.scope;
    });
  }
  populate(){
    this
      .getQuantities()
      .forEach((quantity, i, array) => {
        // check compartmentRef in Species
        quantity.populate(array);
        // check targetRef in Reactions

      });

    return this;
  }
  toQ(){
    let res = super.toQ();
    if(this.scope) res.scope = this.scope;
    if(this.type) res.type = this.type;
    if(this.method) res.method = this.method;

    return res;
  }
}

module.exports = {
  Model
};
