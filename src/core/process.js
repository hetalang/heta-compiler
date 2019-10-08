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
        let {targetArray, isReversible} = rct2actors(q.actors);
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
  static _requirements(){
    return {
      actors: { 
        required: false, 
        isArray: true, path: 'target', 
        isReference: true, targetClass: 'Record', setTarget: true 
      }
    };
  }
}

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
  let matches = /^([^<]*)(<)?[=-]+>?(.*)$/gm.exec(rct);
  let substrates = matches[1];
  let products = matches[3];
  let isReversible = matches[2]==='<';

  let targetArray = [];
  let regexp = /([\d]*)\*?(\w[\w\d]*)/gm;
  let r; // iterator
  while (
    (r = regexp.exec(substrates))!==null
  ){
    targetArray.push({
      target: r[2],
      stoichiometry: (r[1]) ? -r[1] : -1
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
  return {targetArray, isReversible};
}

module.exports = {
  Process,
  _Effector,
  Actor
};
