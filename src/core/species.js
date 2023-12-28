const { Record } = require('./record');
const { UnitTerm } = require('./unit-term');

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
    let logger = this.namespace?.container?.logger;
    let valid = Species.isValid(q, logger);

    if (valid) {
      if (q.compartment !== undefined) this.compartment = q.compartment;
      if (q.isAmount !== undefined) this.isAmount = !!q.isAmount;
    }

    return this;
  }
  get className() {
    return 'Species';
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
    let compartmentUnits = this.compartmentObj?.unitsParsed;
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
  get isExtendedRule(){
    return this.assignments.ode_ !== undefined
      || !this.isAmount;
  }
  _references(){
    let classSpecificRefs = [this.compartment];

    return super._references()
      .concat(classSpecificRefs);
  }
  get legalTerms() {
    let actualCompartmentTerm = this.compartmentObj?.unitsParsed?.toTerm();
    
    if (this.isAmount) {
      return [
        new UnitTerm([{kind: 'amount'}]),
        new UnitTerm([{kind: 'mass'}]),
      ];
    } else if (actualCompartmentTerm !== undefined) {
      return [
        new UnitTerm([{kind: 'amount'}]).divide(actualCompartmentTerm),
        new UnitTerm([{kind: 'mass'}]).divide(actualCompartmentTerm)
      ];
    } else {
      return [
        new UnitTerm([{kind: 'amount'}, {kind: 'length', exponent: -1}]),
        new UnitTerm([{kind: 'amount'}, {kind: 'length', exponent: -2}]),
        new UnitTerm([{kind: 'amount'}, {kind: 'length', exponent: -3}]),
        new UnitTerm([{kind: 'mass'}, {kind: 'length', exponent: -1}]),
        new UnitTerm([{kind: 'mass'}, {kind: 'length', exponent: -2}]),
        new UnitTerm([{kind: 'mass'}, {kind: 'length', exponent: -3}])
      ];
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
