const { Quantity } = require('./quantity');

class Reaction extends Quantity {
  constructor(q){
    super(q);
    Reaction.isValid(q);

    if(q.effectors) {
      this.effectors = q.effectors.map((effector) => new Modifier(effector));
    }
    if(q.actors) {
      this.actors = q.actors.map((actor) => new Reactant(actor));
    }
  }
  static get schemaName(){
    return 'ReactionQ';
  }
  get className(){
    return 'Reaction';
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
