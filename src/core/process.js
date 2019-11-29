const { Record } = require('./record');
const _ = require('lodash');
// const { IndexedHetaError } = require('../heta-error');

class Process extends Record {
  constructor(q = {}){
    super(q);
    this.actors = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Process.isValid(q);
    super.merge(q, skipChecking);
    if(q.actors) {
      if(q.actors instanceof Array){
        this.actors = q.actors
          .map((q) => new Actor(q));
      }else{
        let { targetArray, isReversible } = rct2actors(q.actors);
        this.actors = targetArray
          .map((q) => new Actor(q));
        _.set(this, 'aux.reversible', isReversible);
      }
    }

    return this;
  }
  toQ(){
    let res = super.toQ();
    res.actors = this.actors.map((actor) => {
      return {
        target: actor.target,
        stoichiometry: actor.stoichiometry
      };
    });

    return res;
  }
}

Process._requirements = {
  actors: { 
    required: false, 
    isArray: true, path: 'target', 
    isReference: true, targetClass: 'Record', setTarget: true 
  }
};

class _Effector {
  constructor(q = {}){
    this.target = q.target;
  }
}

class Actor extends _Effector {
  constructor(q = {}){
    super(q);
    this.stoichiometry = q.stoichiometry!==undefined
      ? q.stoichiometry
      : 1; // default value
  }
}

function rct2actors(rct){
  let matches = /^([\w\d\s*+]*)(<)?[=-]+(>)?([\w\d\s*+]*)$/m.exec(rct);
  if(matches===null) throw new TypeError('Wrong ProcessExpr string:', rct);

  let substrates = matches[1];
  let products = matches[4];

  if (matches[2]==='<' && matches[3]==='>'){
    var isReversible = true;
  }else if(matches[3]==='>'){
    isReversible = false;
  }

  let targetArray = [];
  let regexp = /\s*([0-9]*)?\s*\*?\s*(\w[\w\d]*)/gm;
  let r; // iterator
  while (
    (r = regexp.exec(substrates))!==null
  ){
    targetArray.push({
      target: r[2],
      stoichiometry: r[1] ? -r[1] : -1
    });
  }
  while (
    (r = regexp.exec(products))!==null
  ){
    targetArray.push({
      target: r[2],
      stoichiometry: (r[1]) ? +r[1] : 1
    });
  }
  return { targetArray, isReversible };
}

module.exports = {
  Process,
  _Effector,
  Actor,
  rct2actors
};
