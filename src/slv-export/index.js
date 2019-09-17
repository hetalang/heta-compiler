const Container = require('../container');
const { _Export } = require('../core/_export');
const XArray = require('../x-array');
const nunjucks = require('../nunjucks-env');
const { Process } = require('../core/process');
const { Compartment } = require('../core/compartment');
const { Record } = require('../core/record');
const _ = require('lodash');
const { Expression } = require('../core/expression');

class SLVExport extends _Export{
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);
    if(q && typeof q.model===undefined)
      throw new TypeError(`"model" property in SLVExport ${this.id} should be declared.`);
    this.model = q.model;
    if(q.eventsOff) this.eventsOff = q.eventsOff;
    if(q.defaultTask)
      this.defaultTask = q.defaultTask;

    return this;
  }
  get className(){
    return 'SLVExport';
  }
  get ext(){
    return 'slv';
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  do(){
    this._model_ = this._getSLVImage(this.model);

    return this.getSLVCode();
  }
  /**
   * Creates model image by nesessary components based on space.
   * @param {string} targetSpace - Model image to update.
   *
   * @return {undefined}
   */
  _getSLVImage(targetSpace){
    // creates empty model image
    let model = {
      population: this._container.getPopulation(targetSpace, false)
    };

    // add default_compartment_
    let default_compartment_ = new Compartment({
      id: 'default_compartment_',
      space: targetSpace
    }).merge({
      assignments: {
        start_: {expr: 1}
      },
      boundary: true,
      units: 'UL',
      notes: 'This is fake compartment to support compounds without compartment.'
    });
    model.population.push(default_compartment_);

    // push active processes
    model.processes = new XArray();
    model.population.filter((x) => {
      return x instanceof Process
        && x.actors.length>0 // process with actors
        && x.actors.some((actor) => !actor._target_.boundary && !actor._target_.implicitBoundary);// true if there is at least non boundary target
    }).forEach((process) => {
      model.processes.push(process);
    });
    // push non boundary ode variables which are mentioned in processes
    model.variables = new XArray();
    model.population.filter((x) => {
      return x instanceof Record // must be record
        && !x.boundary // not boundary
        && !x.implicitBoundary // not constant, not rule, not explicit diff equation
        && x.backReferences.length>0; // mentioned in process
    }).forEach((record) => {
      model.variables.push(record);
    });
    // create matrix
    model.matrix = [];
    model.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor._target_.boundary
          && !actor._target_.implicitBoundary;
      }).forEach((actor) => {
        let variableNum = model.variables.indexOf(actor._target_);
        model.matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS
    model.rhs = model.population
      .selectByInstance(Record)
      .filter((record) => _.has(record, 'assignments.ode_'))
      .sortExpressionsByScope('ode_');
    // check that all record in start are not Expression
    let startExpressions = model.population
      .selectByInstance(Record)
      .filter((record) => _.get(record, 'assignments.start_') instanceof Expression)
      .filter((record) => record.assignments.start_.num===undefined); // check if it is not Number
    if(startExpressions.length > 0){
      let errorMsg = 'DBSolve does not support expressions string in InitialValues.\n'
        + startExpressions
          .map((x) => `${x.id}$${x.space} []= ${x.assignments.start_.expr}`)
          .join('\n');
      throw new Error(errorMsg);
    }

    // create TimeEvents
    model.events = [];
    model.population
      .selectByClassName('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = !switcher.period || switcher.repeatCount===0
          ? 0
          : switcher.period;
        model.population
          .selectByInstance(Record)
          .filter((record) => _.has(record, 'assignments.' + switcher.id))
          .forEach((record) => { // scan for records in switch
            let expression = record.assignments[switcher.id];
            let [multiply, add] = expression
              .linearizeFor(record.id)
              .map((tree) => {
                if(tree.isSymbolNode){ // a is symbol case, i.e. 'p1'
                  return tree.toString();
                }else{
                  try{ // a can be evaluated, i.e. '3/4'
                    return tree.eval();
                  }catch(e){ // other cases, i.e. 'p1*2'
                    throw new Error(`SLVExport cannot export expression "${record.id} [${switcher.id}]= ${expression.expr}". Use only expressions of type: 'a * ${record.id} + b'`);
                  }
                }
              });

            model.events.push({
              start: switcher.start,
              period: period,
              on: 1,
              target: record.id,
              multiply: multiply,
              add: add
            });
          });
      });

    // search for ContinuousSwitcher
    let bagSwitchers = model.population
      .selectByClassName('ContinuousSwitcher')
      .map((switcher) => switcher.id);
    if(bagSwitchers.length>0){
      throw new Error('ContinuousSwitcher is not supported in SLVExport: ' + bagSwitchers);
    }
    
    return model;
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
    if(this.defaultTask) res.defaultTask = this.defaultTask;
    
    return res;
  }
}

Container.prototype.classes.SLVExport = SLVExport;

module.exports = { SLVExport };
