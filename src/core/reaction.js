const { Process, _Effector, Actor } = require('./process');
const { UnitTerm } = require('./unit-term');
const _ = require('lodash');

/*
  Reaction class

  reaction1 @Reaction {
    modifiers: [M!, M2]
  };
  reaction2 @Reaction {
    modifiers: [{target: M1}, {target: M2}]
  };
*/
class Reaction extends Process {
  constructor(isCore = false){
    super(isCore);
    this.isAmount = true;
    this.modifiers = [];
  }
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = Reaction.isValid(q, logger);

    if (valid) {
      if (q.modifiers) {
        this.modifiers = q.modifiers
          .map((mod) => {
            if (typeof mod==='string') {
              return new Modifier({target: mod});
            } else {
              return new Modifier(mod);
            }
          });
      }
      
      if (q.compartment !== undefined) this.compartment = q.compartment;
      if (q.isAmount !== undefined) this.isAmount = q.isAmount;
    }
    
    return this;
  }
  clone(){
    let clonedComponent = super.clone();

    if (this.modifiers.length > 0)
      clonedComponent.modifiers = this.modifiers.map((modifier) => modifier.clone());
    if (typeof this.isAmount !== 'undefined')
      clonedComponent.isAmount = this.isAmount;

    return clonedComponent;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.modifiers.length>0){
      res.modifiers = options.simplifyModifiers
        ? this.modifiers.map((modifier) => modifier.target )
        : this.modifiers.map((modifier) => { return { target: modifier.target }; });
    }

    if (this.compartment) res.compartment = this.compartment;
    if (this.isAmount !== true) res.isAmount = this.isAmount;

    return res;
  }
}

Reaction._requirements = {
  actors: { 
    required: false, 
    isArray: true, path: 'target', 
    isReference: true, targetClass: 'Species', setTarget: true 
  },
  modifiers: {
    required: false, 
    isArray: true, path: 'target', 
    isReference: true, class: 'Species', setTarget: true 
  },
  compartment: {
    required: false,
    isArray: false,
    isReference: true, targetClass: 'Compartment', setTarget: true 
  }
};

Reaction.legalTerms = [
  new UnitTerm([{kind: 'amount'}, {kind: 'time', exponent: -1}]),
  new UnitTerm([{kind: 'mass'}, {kind: 'time', exponent: -1}])
];

class Modifier extends _Effector {
}

class Reactant extends Actor {
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
