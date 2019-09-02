const Container = require('../container');
const { _Export } = require('../core/_export');
const XArray = require('../x-array');
const nunjucks = require('../nunjucks-env');
const { Process } = require('../core/process');
const { Compartment } = require('../core/compartment');
const { Record } = require('../core/record');
const { Const } = require('../core/const');
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
    let _model_ = {};

    let children = [...this._storage]
      .filter((x) => x[1].space===targetSpace)
      .map((x) => x[1]);
    _model_.population = new XArray(...children);

    // add Const to population
    let messages = [];
    _model_.population
      .selectByInstance(Record)
      .filter((record) => record.assignments)
      .forEach((record) => {
        _.forEach(record.assignments, (value, key) => {
          let deps = value.exprParsed
            .getSymbols()
            .filter((symbol) => ['t'].indexOf(symbol)===-1); // remove t from the search
          deps.forEach((id, i) => {
            let _component_ = _model_.population.getById(id);
            if(!_component_){ // component inside space is not found
              let _global_ = this._storage.get(id);
              if(!_global_){
                messages.push(`Component "${id}" is not found in space "${record.space}" or in global as expected in expression\n`
                + `${record.id}$${record.space} [${key}]= ${value.expr};`);
              }else if(!(_global_ instanceof Const)){
                messages.push(`Component "${id}" is not a Const class as expected in expression\n`
                  + `${record.id}$${record.space} [${key}]= ${value.expr};`);
              }else{
                _model_.population.push(_global_);
              }
            }else if(!(_component_ instanceof Record)){
              messages.push(`Component "${id}$${record.space}" is not a Record class as expected in expression\n`
                + `${record.id}$${record.space} [${key}]= ${value.expr};`);
            }
          });
        });
      });
    if(messages.length>0){
      throw new Error('References error in expressions:\n' + messages.map((m, i) => `(${i}) `+ m).join('\n\n'));
    }

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
    _model_.population.push(default_compartment_);

    // push active processes
    _model_.processes = new XArray();
    _model_.population.filter((x) => {
      return x instanceof Process
        && x.actors.length>0 // process with actors
        && x.actors.some((actor) => !actor._target_.boundary && !actor._target_.implicitBoundary);// true if there is at least non boundary target
    }).forEach((process) => {
      _model_.processes.push(process);
    });
    // push non boundary ode variables which are mentioned in processes
    _model_.variables = new XArray();
    _model_.population.filter((x) => {
      return x instanceof Record // must be record
        && !x.boundary // not boundary
        && !x.implicitBoundary // not constant, not rule, not explicit diff equation
        && x.backReferences.length>0; // mentioned in process
    }).forEach((record) => {
      _model_.variables.push(record);
    });
    // create matrix
    _model_.matrix = [];
    _model_.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor._target_.boundary
          && !actor._target_.implicitBoundary;
      }).forEach((actor) => {
        let variableNum = _model_.variables.indexOf(actor._target_);
        _model_.matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS
    _model_.rhs = _model_.population
      .selectByInstance(Record)
      .filter((record) => _.has(record, 'assignments.ode_'))
      .sortExpressionsByScope('ode_');
    // check that all record in start are not Expression
    let startExpressions = _model_.population
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
    _model_.events = [];
    _model_.population
      .selectByClassName('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = !switcher.period || switcher.repeatCount===0
          ? 0
          : switcher.period;
        _model_.population
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

            _model_.events.push({
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
    let bagSwitchers = _model_.population
      .selectByClassName('ContinuousSwitcher')
      .map((switcher) => switcher.id);
    if(bagSwitchers.length>0){
      throw new Error('ContinuousSwitcher is not supported in SLVExport: ' + bagSwitchers);
    }
    return _model_;
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
