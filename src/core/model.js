const _ = require('lodash');
const { _Simple } = require('./_simple');
const { Quantity } = require('./quantity');

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
    if(this.method) res.method = _.cloneDeep(this.method);

    return res;
  }
}

module.exports = {
  Model
};
