const { Record } = require('./record');

class Compartment extends Record {
  constructor(isCore = false){
    super(isCore);
  }
  merge(q, skipChecking){
    if(!skipChecking) Compartment.isValid(q);
    super.merge(q, skipChecking);
    
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
