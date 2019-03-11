const { Quantity } = require('./quantity');
const { ValidationError } = require('./utilities');
const { Species } =require('./species');

class Process extends Quantity {
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
        throw new ValidationError(`target reffered to absent value "${actor.target}" in reaction ${this.index}`);
      } else {
        if(!(targetObj instanceof Species)) {
          throw new ValidationError(`target reffered to not a Species "${actor.target}" in reaction ${this.index}`);
        } else {
          actor.targetObj = targetObj;
        }
      }
    });
    this.effectors.forEach((effector) => {
      let targetObj = storage.find((x) => x.id===effector.target);
      if(!targetObj) {
        throw new ValidationError(`target reffered to absent value "${effector.target}" in reaction ${this.index}`);
      } else {
        if(!(targetObj instanceof Species)) {
          throw new ValidationError(`target reffered to not a Species "${effector.target}" in reaction ${this.index}`);
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

module.exports = {
  Process,
  Effector,
  Actor
};
