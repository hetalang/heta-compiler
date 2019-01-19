const { Quantity } = require('./quantity');

class Process extends Quantity {
  constructor(){
    super();
    this.effectors = [];
    this.actors = [];
  }
  merge(q){
    Process.isValid(q);
    super.merge(q);
    if(q.effectors) {
      this.effectors = q.effectors.map((q) => new Effector(q));
    }
    if(q.actors) {
      this.actors = q.actors.map((q) => new Actor(q));
    }

    return this;
  }
  static get schemaName(){
    return 'ProcessQ';
  }
  get className(){
    return 'Process';
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

class Effector {
  constructor(q){
    this.targetRef = q.targetRef;
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

module.exports = {
  Process,
  Effector,
  Actor
};
