const { Quantity } = require('./quantity');
const { Process, Effector, Actor } = require('./process');

class Reaction extends Process {
  constructor(){
    super();
  }
  merge(q){
    Reaction.isValid(q);
    super.merge(q);

    return this;
  }
  static get schemaName(){
    return 'ReactionQ';
  }
  get className(){
    return 'Reaction';
  }
}

class Modifier extends Effector {
}

class Reactant extends Actor {
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
