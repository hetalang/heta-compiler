const { Quantity } = require('./quantity');
const { Process, Effector, Actor } = require('./process');

class Reaction extends Process {
  constructor(){
    super();
  }
  merge(q, skipChecking){
    if(!skipChecking) Reaction.isValid(q);
    super.merge(q, skipChecking);

    return this;
  }
  static get schemaName(){
    return 'ReactionP';
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
