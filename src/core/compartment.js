const { Quantity } = require('./quantity');

class Compartment extends Quantity {
  constructor(){
    super();
  }
  merge(q, skipChecking){
    if(!skipChecking) Compartment.isValid(q);
    super.merge(q, skipChecking);
    // nothing

    return this;
  }
  static get schemaName(){
    return 'CompartmentP';
  }
  get className(){
    return 'Compartment';
  }
}

module.exports = {
  Compartment
};
