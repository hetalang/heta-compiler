const { Component } = require('./component');
const _ = require('lodash');

class SimpleTask extends Component {
  merge(q = {}){
    super.merge(q);
    let logger = _.get(this, 'namespace.container.logger');
    let valid = SimpleTask.isValid(q, logger);

    if (valid) {
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
  clone(){
    let clonedComponent = super.clone();
    if (typeof this.type !== 'undefined')
      clonedComponent.type = this.type;
    if (_.size(this.subtasks) > 0 ) {
      clonedComponent.subtasks = this.subtasks.map((st) => st.clone());
    }
    if (typeof this.tspan !== 'undefined') {
      clonedComponent.tspan = this.tspan;
    }
    if (typeof this.reassign !== 'undefined') {
      clonedComponent.reassign = _.mapValues(this.reassign, (x) => x);
    }
    if (typeof this.solver !== 'undefined')
      clonedComponent.solver = _.cloneDeep(this.solver);

    return clonedComponent;
  }
  bind(namespace){
    super.bind(namespace);
    let logger = this.namespace.container.logger;

    // check output refs in SimpleTasks XXX: it seems to be working but ugly and without iterativity
    if(this instanceof SimpleTask && this.subtasks){
      this.subtasks.forEach((sub) => { // iterate through subtasks
        sub.output.forEach((out) => { // itrate through record refs
          let _record_ = namespace.get(out);
          if (!_record_) {
            let msg = `Property "output" has lost reference for "${out}".`;
            logger.error(msg, {type: 'BindingError', space: this.space});
          } else if (_record_.instanceOf('Record')){
            // do not attach
          } else {
            let msg = `"output" prop must be reffered to Record but now on ${_record_.className}.`;
            logger.error(msg, {type: 'BindingError', space: this.space});
          }
        });
      });
    }
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if (this.type) res.type = this.type;
    if (this.subtasks) res.subtasks = this.subtasks;
    if (_.size(this.reassign)) res.reassign = _.cloneDeep(this.reassign);
    if (_.size(this.solver)) res.solver = _.cloneDeep(this.solver);
    if (this.tspan) res.tspan = _.cloneDeep(this.tspan);
    return res;
  }
}

SimpleTask._requirements = {
  type: {
    required: true, 
    isReference: false
  },
  // temporaly excluded because cannot analyse arrays of objects
  //'subtasks.output': {required: true, isArray: true, isReference: true, targetClass: 'Record'}
};

class Subtask {
  constructor(q = {}){
    if (q.saveat) this.saveat = q.saveat;
    if (q.output) this.output = q.output;
  }
  clone(){
    let clonedSubtask = new Subtask({
      saveat: this.saveat,
      output: this.output
    });

    return clonedSubtask;
  }
}

module.exports = {
  Subtask,
  SimpleTask
};
