const Container = require('../container');
const { _Export } = require('../core/_export');
// const { IndexedHetaError } = require('../heta-error');
// const { Model } = require('../core/model');
const XArray = require('../x-array');
const nunjucks = require('../nunjucks-env');
const { Process } = require('../core/process');
const { Compartment } = require('../core/compartment');
const { Record } = require('../core/record');
const _ = require('lodash');
const { Expression } = require('../core/expression');

class SLVExport extends _Export{
  merge(q, skipChecking){
    super.merge(q, skipChecking);
    if(q && typeof q.model===undefined)
      throw new TypeError(`"model" property in SLVExport ${this.id} should be declared.`);
    this.model = q.model;
    if(q.eventsOff) this.eventsOff = q.eventsOff;

    return this;
  }
  get className(){
    return 'SLVExport';
  }
  get ext(){
    return 'slv';
  }
  do(){
    // another approach where model created dynamically
    this._model_ = {
      targetSpace: this.model
    };

    this.populate(this._model_);
    return this.getSLVCode();
  }
  populate(_model_){
    let children = [...this._storage]
      .filter((x) => x[1].space===_model_.targetSpace)
      .map((x) => x[1]);
    _model_.population = new XArray(...children);

    // add default_compartment_
    let default_compartment_ = new Compartment({
      id: 'default_compartment_',
      space: _model_.targetSpace
    }).merge({
      assignments: {
        start_: {size: 1, increment: false}
      },
      boundary: true,
      units: 'UL',
      notes: 'This is fake compartment to support compounds without compartment.'
    });
    _model_.population.push(default_compartment_);

    // push active processes
    _model_.processes = new XArray();
    _model_.variables = new XArray();
    _model_.matrix = [];
    _model_.population.filter((x) => {
      return x instanceof Process
        && x.actors.length>0 // process with actors
        && x.actors.some((actor) => !actor._target_.boundary && !actor._target_.implicitBoundary);// true if there is at least non boundary target
    }).forEach((process) => {
      _model_.processes.push(process);
    });
    // push non boundary ode variables which are mentioned in processes
    _model_.population.filter((x) => {
      return x instanceof Record
        && !x.boundary
        && !x.implicitBoundary
        && x.backReferences.length>0;
    }).forEach((record) => {
      _model_.variables.push(record);
    });
    // create matrix
    _model_.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor._target_.boundary
          && !actor._target_.implicitBoundary;
      }).forEach((actor) => {
        let variableNum = _model_.variables.indexOf(actor._target_);
        _model_.matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });
    // push virtual processes and variables with ode_.increment
    children.filter((x) => {
      return x instanceof Record
        && _.get(x, 'assignments.ode_.increment');
    }).forEach((record) => {
      // create process for the record
      // virtual process existed only in res.processes array
      let process = new Process({id: `${record.id}_rate_`, space: record.space})
        .merge({
          actors: [
            {target: record.id, stoichiometry: 1} // add record as actor but without backReferences
          ],
          assignments: {
            ode_: {size: record.assignments.ode_.size} // copy size from record, increment = false
          }
        });
      process.actors[0]._target_ = record; // force setting of target object
      process.isVirtual = true;
      _model_.processes.push(process);
      _model_.population.push(process);

      // push process with ode_.increment to variables array
      _model_.variables.push(record);

      // set stoichiometry in matrix
      let processNum = _model_.processes.length - 1;
      let variableNum = _model_.variables.indexOf(record);
      _model_.matrix.push([processNum, variableNum, 1]);
    });

    // create and sort expressions for RHS
    _model_.rhs = _model_.population
      .selectByInstance(Record)
      .filter((record) => _.has(record, 'assignments.ode_'))
      .sortExpressionsByScope('ode_');
    // check that all record in start are not Expression
    let startExpressions = _model_.population
      .selectByInstance(Record)
      .filter((record) => _.get(record, 'assignments.start_.size') instanceof Expression);
    if(startExpressions.length > 0){
      let errorMsg = 'DBSolve does not support expressions in InitialValues.\n'
        + startExpressions
          .map((x) => `${x.id}$${x.space} []= ${x.assignments.start_.size.expr}`)
          .join('\n');
      throw new Error(errorMsg);
    }
  }
  getSLVCode(){
    return nunjucks.render(
      'slv-export/blocks-template.slv.njk',
      this
    );
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    if(this.eventsOff) res.eventsOff = this.eventsOff;
    return res;
  }
}

Container.prototype.classes.SLVExport = SLVExport;

module.exports = { SLVExport };
