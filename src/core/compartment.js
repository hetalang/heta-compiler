const { Record } = require('./record');

class Compartment extends Record {
  constructor(){
    super();
    this.isAmount = true;
  }
  merge(q, skipChecking){
    if(!skipChecking) Compartment.isValid(q);
    super.merge(q, skipChecking);
    
    if(q.compartment!==undefined) this.compartment = q.compartment;
    if(q.isAmount!==undefined) this.isAmount = q.isAmount;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.compartment) res.compartment = this.compartment;
    if(this.isAmount!==true) res.isAmount = this.isAmount;
    
    return res;
  }
}

module.exports = {
  Compartment
};
