const { Record } = require('./record');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);
const _ = require('lodash');

class Species extends Record {
  merge(q, skipChecking){
    if(!skipChecking) Species.isValid(q);
    super.merge(q, skipChecking);

    if(q.compartment!==undefined) this.compartment = q.compartment;
    if(q.boundary!==undefined) this.boundary = q.boundary;
    if(q.isAmount!==undefined) this.isAmount = q.isAmount;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    res.compartment = this.compartment;
    if(this.boundary) res.boundary = this.boundary;
    if(this.isAmount) res.isAmount = this.isAmount;
    return res;
  }
  unitsSBML(){
    let compartmentUnits = _.get(this, 'compartmentObj.unitsParsed');
    if (!this.isAmount && compartmentUnits!==undefined && this.unitsParsed!==undefined) {
      return this.unitsParsed
        .multiply(compartmentUnits)
        .simplify();
    } else if (this.isAmount && this.unitsParsed!==undefined) {
      return this.unitsParsed;
    } else {
      return undefined;
    }
  }
  unitsHash(useSBMLUnits){ // get normal or substance units
    if(!useSBMLUnits && this.unitsParsed!==undefined){
      return this.unitsParsed.toHash();
    }else if(useSBMLUnits && this.unitsSBML()){
      return this.unitsSBML().toHash();
    }
  }
}

Species._requirements = {
  compartment: {
    required: true,
    isArray: false,
    isReference: true, targetClass: 'Compartment', setTarget: true 
  }
};

module.exports = {
  Species
};
