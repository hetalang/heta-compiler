const { Record } = require('./record');

class Compartment extends Record {
  merge(q, skipChecking){
    if(!skipChecking) Compartment.isValid(q);
    super.merge(q, skipChecking);
    // nothing
    return this;
  }
}

module.exports = {
  Compartment
};
