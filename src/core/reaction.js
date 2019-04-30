const { Record } = require('./record');
const { Process, _Effector, Actor } = require('./process');

class Reaction extends Process {
  constructor(q = {}){
    super(q);
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

    return this;
  }
  static get schemaName(){
    return 'ReactionP';
  }
  get className(){
    return 'Reaction';
  }
  toQ(){
    let res = super.toQ();
    res.modifiers = this.modifiers.map((modifier) => {
      return {
        target: modifier.target
      };
    });

    return res;
  }
}

class Modifier extends _Effector {
}

class Reactant extends Actor {
}

module.exports = {
  Reaction,
  Modifier,
  Reactant
};
