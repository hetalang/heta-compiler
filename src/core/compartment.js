const { Record } = require('./record');

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
    //let logger = this.namespace.container.logger;
    //let valid = Compartment.isValid(q, logger);
    
    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    // nothing
    return res;
  }
}

module.exports = {
  Compartment
};
