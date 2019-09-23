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
  toQ(){
    let res = super.toQ();
    res.compartment = this.compartment;
    if(this.boundary) res.boundary = this.boundary;
    if(this.isAmount) res.isAmount = this.isAmount;
    return res;
  }
  get requirements(){
    return {
      compartment: { required: true, isReference: true, class: 'Compartment', setTarget: true }
    };
  }
  SBMLUnits(){
    let compartmentUnits = _.get(this, 'compartmentObj.units');
    if(compartmentUnits!==undefined && this.units!==undefined && !this.isAmount){
      return this.units + '*' + compartmentUnits;
    }else{
      return this.units;
    }
  }
  unitsHash(useSBMLUnits){ // get normal or substance units
    if(!useSBMLUnits && this.units){
      return uParser
        .parse(this.units)
        .toHash();
    }else if(useSBMLUnits && this.SBMLUnits()){
      return uParser
        .parse(this.SBMLUnits())
        .toHash();
    }
  }
}

module.exports = {
  Species
};
