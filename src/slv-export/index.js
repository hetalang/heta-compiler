const Container = require('../container');
const { _Export } = require('../core/_export');
// const { IndexedHetaError } = require('../heta-error');
// const { Model } = require('../core/model');
const Scene = require('../core/scene');
const nunjucks = require('../nunjucks-env');
const { Process } = require('../core/process');
const { Compartment } = require('../core/compartment');
const { Record, Assignment } = require('../core/record');
const _ = require('lodash');

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
    this._model_ = new Scene(this.model);

    // using global shared model
    // this._model_ = this._storage.get(this.model);
    //if(this._model_===undefined)
    //  throw new IndexedHetaError(this.indexObj, `Required property model reffers to lost model id "${this.model}".`);
    this.populateScene(this._model_);
    return this.getSLVCode();
  }
  populateScene(scene){
    let children = [...this._storage]
      .filter((x) => x[1].space===scene.targetSpace)
      .map((x) => x[1]);
    scene.population = children;
    // scene.population.push(...children);

    // add default_compartment_
    let default_compartment_ = new Compartment({
      id: 'default_compartment_',
      space: scene.targetSpace
    }).merge({
      assignments: {
        start_: {size: 1, increment: false}
      },
      boundary: true,
      units: 'UL',
      notes: 'This is fake compartment to support compounds without compartment.'
    });
    scene.population.push(default_compartment_);

    // push active processes
    scene.processes = [];
    scene.variables = [];
    scene.matrix = [];
    scene.population.filter((x) => {
      return x instanceof Process
        && x.actors.length>0 // process with actors
        && x.actors.some((actor) => !actor._target_.boundary && !actor._target_.implicitBoundary);// true if there is at least non boundary target
    }).forEach((process) => {
      scene.processes.push(process);
    });
    // push non boundary ode variables which are mentioned in processes
    scene.population.filter((x) => {
      return x instanceof Record
        && !x.boundary
        && !x.implicitBoundary
        && x.backReferences.length>0;
    }).forEach((record) => {
      scene.variables.push(record);
    });
    // create matrix
    scene.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor._target_.boundary
          && !actor._target_.implicitBoundary;
      }).forEach((actor) => {
        let variableNum = scene.variables.indexOf(actor._target_);
        scene.matrix.push([processNum, variableNum, actor.stoichiometry]);
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
      scene.processes.push(process);
      scene.population.push(process);

      // push process with ode_.increment to variables array
      scene.variables.push(record);

      // set stoichiometry in matrix
      let processNum = scene.processes.length - 1;
      let variableNum = scene.variables.indexOf(record);
      scene.matrix.push([processNum, variableNum, 1]);
    });
    //console.log(scene.processes[2].assignments);
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
