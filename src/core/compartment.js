const { Record } = require('./record');
const { UnitTerm } = require('./unit-term');

/*
  Compartment class

  compartment1 @Compartment {
    // no specific properties
  };
*/
class Compartment extends Record {
  constructor(isCore = false){
    super(isCore);
  }
  merge(q = {}){
    super.merge(q);
    //let logger = _.get(this, 'namespace.container.logger');
    //let valid = Compartment.isValid(q, logger);
    
    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    // nothing
    return res;
  }
  get legalTerms(){
    return [
      new UnitTerm([{kind: 'length', exponent: 3}]),
      new UnitTerm([{kind: 'length', exponent: 2}]),
      new UnitTerm([{kind: 'length', exponent: 1}])
    ];
  }
}

module.exports = {
  Compartment
};
