const { Quantity } = require('./quantity');

class Compartment extends Quantity {
  constructor(q){
    super(q);
    Compartment.isValid(q);
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
