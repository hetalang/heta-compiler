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
  toQ(){
    let res = super.toQ();
    if(this.modifiers.length>0){
      res.modifiers = this.modifiers.map((modifier) => {
        return {
          target: modifier.target
        };
      });
    }

    return res;
  }
  static _requirements(){
    return {
      actors: { 
        required: false, 
        isArray: true, path: 'target', 
        isReference: true, targetClass: 'Species', setTarget: true 
      },
      modifiers: {
        required: false, 
        isArray: true, path: 'target', 
        isReference: true, class: 'Species', setTarget: true }
    };
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
