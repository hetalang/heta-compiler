const { Process, _Effector, Actor } = require('./process');

class Reaction extends Process {
  constructor(isCore = false){
    super(isCore);
    this.isAmount = true;
    this.modifiers = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Reaction.isValid(q);
    super.merge(q, skipChecking);

    if(q.modifiers) {
      this.modifiers = q.modifiers
        .map((mod) => {
          if(typeof mod==='string'){
            return new Modifier({target: mod});
          }else{
            return new Modifier(mod);
          }
        });
    }
    
    if(q.compartment!==undefined) this.compartment = q.compartment;
    if(q.isAmount!==undefined) this.isAmount = q.isAmount;

    return this;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.modifiers.length>0){
      res.modifiers = options.simplifyModifiers
        ? this.modifiers.map((modifier) => modifier.target )
        : this.modifiers.map((modifier) => { return { target: modifier.target }; });
    }

    if(this.compartment) res.compartment = this.compartment;
    if(this.isAmount!==true) res.isAmount = this.isAmount;

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

class Modifier extends _Effector {
}

class Reactant extends Actor {
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
