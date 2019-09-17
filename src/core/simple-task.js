const { _Scoped } = require('./_scoped');
const _ = require('lodash');

class SimpleTask extends _Scoped {
  merge(q={}, skipChecking){
    if(!skipChecking) SimpleTask.isValid(q);
    super.merge(q, skipChecking);

    if(q.type) this.type = q.type;
    if(q.subtasks){
      this.subtasks = q.subtasks.map((q) => new Subtask(q));
    }
    if(q.tspan){
      this.tspan = q.tspan;
    }else{
      this.tspan = [0, 100];
    }
    if(q.reassign){
      this.reassign = _.mapValues(q.reassign, (x) => x);
    }else{
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

    return this;
  }
  static get schemaName(){
    return 'SimpleTaskP';
  }
  get className(){
    return 'SimpleTask';
  }
  toQ(){
    let res = super.toQ();
    if(this.type) res.type = this.type;
    if(this.subtasks) res.subtasks = this.subtasks;
    if(_.size(this.reassign)) res.reassign = _.cloneDeep(this.reassign);
    if(_.size(this.solver)) res.solver = _.cloneDeep(this.solver);
    if(this.tspan) res.tspan = _.cloneDeep(this.tspan);
    return res;
  }
}

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
