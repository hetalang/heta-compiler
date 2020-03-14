const { Record } = require('./record');
const _ = require('lodash');
const { BindingError } = require('../heta-error');

/* 
  Species class

  species1 @Species {
    compartment: comp1,
    isAmount: true
  };
*/
class Species extends Record {
  merge(q, skipChecking){
    if(!skipChecking) Species.isValid(q);
    super.merge(q, skipChecking);

    if(q.compartment!==undefined) this.compartment = q.compartment;
    if(q.isAmount!==undefined) this.isAmount = q.isAmount;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.compartment) res.compartment = this.compartment;
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
  dependOn(context, includeCompatment = false){
    if(!this.isAmount && this.compartment === undefined)
      throw new BindingError(this.index, [], 'compartment should be set for Species when isAmount=false');
    let deps = super.dependOn(context);
    if (includeCompatment && !this.isAmount && !this.isRule) {
      deps.push(this.compartment);
    }

    return deps;
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
