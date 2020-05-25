const { Record } = require('./record');
const _ = require('lodash');

/* 
  Species class

  species1 @Species {
    compartment: comp1,
    isAmount: true
  };
*/
class Species extends Record {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Species.isValid(q, logger);

    if (valid) {
      if (q.compartment !== undefined) this.compartment = q.compartment;
      if (q.isAmount !== undefined) this.isAmount = q.isAmount;
    }

    return this;
  }
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.compartment !== 'undefined')
      clonedComponent.compartment = this.compartment;
    if (typeof this.isAmount !== 'undefined')
      clonedComponent.isAmount = this.isAmount;

    return clonedComponent;
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
  dependOn(context, includeCompartment = false){
    let deps = super.dependOn(context);

    let useCompartment = includeCompartment 
      && this.compartment !== undefined 
      && !this.isAmount 
      && !this.isRule;
    if (useCompartment) deps.push(this.compartment);

    return deps;
  }
  _references(){
    let classSpecificRefs = [this.compartment];

    return super._references()
      .concat(classSpecificRefs);
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
