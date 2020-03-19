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
    let validationLogger = Compartment.isValid(q);

    this.logger.pushMany(validationLogger);
    
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
