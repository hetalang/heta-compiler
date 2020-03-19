const { _Component } = require('./_component');
const _ = require('lodash');
const { IndexedHetaError} = require('../heta-error');

class SimpleTask extends _Component {
  merge(q = {}){
    super.merge(q);
    let validationLogger = SimpleTask.isValid(q);

    this.logger.pushMany(validationLogger);
    if (!validationLogger.hasErrors) {
      if (q.type) this.type = q.type;
      if (q.subtasks) {
        this.subtasks = q.subtasks.map((q) => new Subtask(q));
      }
      if (q.tspan) {
        this.tspan = q.tspan;
      } else {
        this.tspan = [0, 100];
      }
      if (q.reassign) {
        this.reassign = _.mapValues(q.reassign, (x) => x);
      } else {
        this.reassign = {};
      }
      let defaultSolver = {
        alg: 'lsode',
        reltol: 1e-6,
        abstol: 1e-6,
        maxiters: 1e5,
        dt: 0,
        dtmin: 0,
        dtmax: 0,
        tstops: []
      };
      this.solver = _.defaultsDeep(q.solver, defaultSolver);
    }
    
    return this;
  }
  bind(namespace){
    let logger = super.bind(namespace);

    // check output refs in SimpleTasks XXX: it seems to be working but ugly and without iterativity
    if(this instanceof SimpleTask && this.subtasks){
      this.subtasks.forEach((sub) => { // iterate through subtasks
        sub.output.forEach((out) => { // itrate through record refs
          let _record_ = namespace.get(out);
          if(!_record_){
            let msg = `Property "output" has lost reference for "${out}".`;
            throw new IndexedHetaError(this.indexObj, msg);
          }else if(_record_.instanceOf('Record')){
            // do not attach
          }else{
            let msg = `"output" prop must be reffered to Record but now on ${_record_.className}.`;
            throw new IndexedHetaError(this.indexObj, msg);
          }
        });
      });
    }

    return logger;
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.type) res.type = this.type;
    if(this.subtasks) res.subtasks = this.subtasks;
    if(_.size(this.reassign)) res.reassign = _.cloneDeep(this.reassign);
    if(_.size(this.solver)) res.solver = _.cloneDeep(this.solver);
    if(this.tspan) res.tspan = _.cloneDeep(this.tspan);
    return res;
  }
}

SimpleTask._requirements = {
  type: {
    required: true, 
    isReference: false
  },
  // temporaly excluded because cannot analyse arrays of objects
  //'subtasks.output': {required: true, isArray: true, isReference: true, class: 'Record'}
};

class Subtask {
  constructor(q={}){
    if(q.saveat) this.saveat = q.saveat;
    if(q.output) this.output = q.output;
  }
}

module.exports = {
  Subtask,
  SimpleTask
};
