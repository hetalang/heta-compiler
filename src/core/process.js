const { Record } = require('./record');
const { IndexedHetaError } = require('../heta-error');
const { Species } =require('./species');

class Process extends Record {
  constructor(ind){
    super(ind);
    this.effectors = [];
    this.actors = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Process.isValid(q);
    super.merge(q, skipChecking);
    if(q.effectors) {
      this.effectors = q.effectors.map((q) => new Effector(q));
    }
    if(q.actors) {
      if(q.actors instanceof Array){
        this.actors = q.actors
          .map((q) => new Actor(q));
      }else{
        //throw new Error('String actors is not implemented yet.');
        this.actors = rct2actors(q.actors)
          .map((q) => new Actor(q));
      }
    }

    return this;
  }
  static get schemaName(){
    return 'ProcessP';
  }
  get className(){
    return 'Process';
  }
  toQ(){
    let res = super.toQ();
    res.actors = this.actors.map((actor) => {
      return {
        target: actor.target,
        stoichiometry: actor.stoichiometry
      };
    });
    res.effectors = this.effectors.map((effector) => {
      return {
        target: effector.target
      };
    });
    return res;
  }

  populate(storage){
    super.populate(storage);

    this.actors.forEach((actor) => {
      let targetObj = storage.find((x) => x.id===actor.target);
      if(!targetObj) {
        throw new IndexedHetaError(this.indexObj, `target reffered to absent value "${actor.target}" in reaction.`);
      } else {
        if(!(targetObj instanceof Species)) {
          throw new IndexedHetaError(this.indexObj, `target reffered to not a Species "${actor.target}" in reaction.`);
        } else {
          actor.targetObj = targetObj;
        }
      }
    });
    this.effectors.forEach((effector) => {
      let targetObj = storage.find((x) => x.id===effector.target);
      if(!targetObj) {
        throw new IndexedHetaError(this.indexObj, `target reffered to absent value "${effector.target}" in reaction.`);
      } else {
        if(!(targetObj instanceof Species)) {
          throw new IndexedHetaError(this.indexObj, `target reffered to not a Species "${effector.target}" in reaction.`);
        } else {
          effector.targetObj = targetObj;
        }
      }
    });
  }

}

class Effector {
  constructor(q){
    this.target = q.target;
  }
}

class Actor extends Effector {
  constructor(q){
    super(q);
    this.stoichiometry = q.stoichiometry!==undefined
      ? q.stoichiometry
      : 1; // default value
  }
}

function rct2actors(rct){
  var matches = /^(.*)<?[=-]>?(.*)$/gm.exec(rct);
  var substrates = matches[1];
  var products = matches[2];

  var targetArray = [];
  var regexp = /([\d]*)\*?(\w[\w\d]*)/gm;
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
  return targetArray;
}

module.exports = {
  Process,
  Effector,
  Actor
};
