const { Record } = require('./record');
// const { IndexedHetaError } = require('../heta-error');

class Process extends Record {
  constructor(q = {}){
    super(q);
    this.actors = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Process.isValid(q);
    super.merge(q, skipChecking);
    if(q.effectors) {
      this.effectors = q.effectors.map((q) => new _Effector(q));
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
  get isProcess(){
    return true;
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
  _Effector,
  Actor
};
