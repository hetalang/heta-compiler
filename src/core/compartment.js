const { Quantity } = require('./quantity');

class Compartment extends Quantity {
  constructor(q){
    super(q);
    Compartment.isValid(q);
  }
  merge(q){
    Compartment.isValid(q);
    super.merge(q);
    // nothing

    return this;
  }
  static get schemaName(){
    return 'CompartmentQ';
  }
  get className(){
    return 'Compartment';
  }
}

module.exports = {
  Compartment
};
