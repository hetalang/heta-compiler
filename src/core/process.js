const { Record } = require('./record');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    actors: {
      oneOf: [
        { type: "array", items: {'$ref': "#/definitions/Actor"}, errorMessage:  {type: 'should be an array of actors.'}},
        { '$ref': '#/definitions/ProcessExpr' },
        { type: 'null'}
      ]
    }
  },
  errorMessage: {
    properties: {
      actors: 'is not string or array.'
    }
  }
};

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
    this.reversible = true;
  }
  merge(q = {}){
    super.merge(q);
    let logger = this._container?.logger;
    let valid = Process.isValid(q, logger);

    if (valid) {
      if (q.actors !== undefined) {
        if (q.actors instanceof Array) {
          this.actors = q.actors
            .map((q) => new Actor(q));
        } else if (q.actors === null) {
          this.actors = [];
        } else {
          let { targetArray, isReversible } = rct2actors(q.actors);
          this.actors = targetArray
            .map((q) => new Actor(q));
          this.reversible = isReversible;
        }
      }
      if (q.reversible === null) {
        this.reversible = true;
      } else if (q.reversible !== undefined) {
        this.reversible = !!q.reversible;
      }
    }
    
    return this;
  }
  get className() {
    return 'Process';
  }
  clone(){
    let clonedComponent = super.clone();
    if (this.actors !== undefined)
      clonedComponent.actors = this.actors.map((actor) => actor.clone());

    clonedComponent.reversible = this.reversible;

    return clonedComponent;
  }
  bind(namespace) {
    super.bind(namespace);
    let {logger} = this._container;

    // check and warn if actors is empty
    if (this.actors.length === 0) {
      let msg = `Process "${this.index}" has no actors.`
      logger.warn(msg, {type: 'BindingError', space: this.space});
    }

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
    if (this.reversible !== true) res.reversible = this.reversible;

    return res;
  }
  _references() {
    let classSpecificRefs = this.actors.map((actor) => actor.target);

    return super._references().concat(classSpecificRefs);
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
  clone(){
    let clonedEffector = new _Effector({
      target: this.target
    });

    return clonedEffector;
  }
}

class Actor extends _Effector {
  constructor(q = {}){
    super(q);
    this.stoichiometry = q.stoichiometry!==undefined
      ? q.stoichiometry
      : 1; // default value
  }
  clone(){
    let clonedActor = new Actor({
      target: this.target,
      stoichiometry: this.stoichiometry
    });

    return clonedActor;
  }
  get className(){
    return 'Actor';
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

function rct2actors(rct){
  let matches = /^([\w\d\s*+]*)(<)?[=-]?(>)?([\w\d\s*+]*)$/m.exec(rct);
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
