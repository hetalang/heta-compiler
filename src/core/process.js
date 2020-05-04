const { Record } = require('./record');
const _ = require('lodash');

/*
  Process class

  process1 @Process {
    actors: A => B
  };
  process2 @Process {
    actors: [{target: A, stoichiometry: -1}, {target: B, stoichiometry: 1}]
  };
*/
class Process extends Record {
  constructor(isCore = false){
    super(isCore);
    this.actors = [];
  }
  merge(q = {}){
    super.merge(q);
    let validationLogger = Process.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
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
    }
    
    return this;
  }
  get processExpr(){
    return actors2rct(this.actors);
  }
  toQ(options = {}){
    let res = super.toQ(options);
    res.actors = options.simplifyActors
      ? this.processExpr
      : this.actors.map((actor) => {
        return { target: actor.target, stoichiometry: actor.stoichiometry };
      });

    return res;
  }
  references(){
    let classSpecificRefs = this.actors
      .map((actor) => actor.target);

    return super.references()
      .concat(classSpecificRefs);
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
  get className(){
    return 'Actor';
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

function actors2rct(actors = []){

  let left = actors.filter((x) => x.stoichiometry < 0).map((x) => {
    if(x.stoichiometry === -1){
      return x.target;
    }else{
      return -x.stoichiometry + '*' + x.target;
    }
  }).join(' + ');

  let right = actors.filter((x) => x.stoichiometry > 0).map((x) => {
    if(x.stoichiometry === 1){
      return x.target;
    }else{
      return x.stoichiometry + '*' + x.target;
    }
  }).join(' + ');

  return left + ' = ' + right;
}

module.exports = {
  Process,
  _Effector,
  Actor,
  rct2actors
};
