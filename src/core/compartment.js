const { Record } = require('./record');

class Compartment extends Record {
  constructor(ind){
    super(ind);
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
