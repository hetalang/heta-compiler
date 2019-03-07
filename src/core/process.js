const { Quantity } = require('./quantity');
const exception = require('./utilities');
const { Species } =require('./species');

class Process extends Quantity {
  constructor(){
    super();
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
      this.actors = q.actors.map((q) => new Actor(q));
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

  populate(storage){
    super.populate(storage);

    this.actors.forEach((actor) => {
      let target = storage.find((x) => x.id===actor.targetRef);
      if(!target) {
        exception(`targetRef reffered to absent value "${actor.targetRef}" in reaction ${this.index}`);
      } else {
        if(!(target instanceof Species)) {
          exception(`targetRef reffered to not a Species "${actor.targetRef}" in reaction ${this.index}`);
        } else {
          actor.target = target;
        }
      }
    });
    this.effectors.forEach((effector) => {
      let target = storage.find((x) => x.id===effector.targetRef);
      if(!target) {
        exception(`targetRef reffered to absent value "${effector.targetRef}" in reaction ${this.index}`);
      } else {
        if(!(target instanceof Species)) {
          exception(`targetRef reffered to not a Species "${effector.targetRef}" in reaction ${this.index}`);
        } else {
          effector.target = target;
        }
      }
    });
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
