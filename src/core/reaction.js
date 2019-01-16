const { Quantity } = require('./quantity');

class Reaction extends Quantity {
  constructor(){
    super();
    this.effectors = [];
    this.actors = [];
  }
  merge(q){
    super.merge(q);
    // Reaction.isValid(q);
    if(q.effectors) {
      this.effectors = q.effectors.map((effector) => new Modifier(effector));
    }
    if(q.actors) {
      this.actors = q.actors.map((actor) => new Reactant(actor));
    }

    return this;
  }
  static get schemaName(){
    return 'ReactionQ';
  }
  get className(){
    return 'Reaction';
  }
  toQ(){
    let res = super.toQ();
    res.actors = this.actors.map((actor) => {
      return {
        targetRef: actor.targetRef,
        stoichiometry: actor.stoichiometry
      };
    });
    res.effectors = this.effectors.map((effector) => {
      return {
        targetRef: effector.targetRef
      };
    });
    return res;
  }
}

class Modifier {
  constructor(q){
    this.targetRef = q.targetRef;
  }
}

class Reactant extends Modifier {
  constructor(q){
    super(q);
    this.stoichiometry = q.stoichiometry!==undefined
      ? q.stoichiometry
      : 1; // default value
  }
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
