const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
//require('./expression'); // use expression.js from dbsolve-export

class SLVExport extends _Export{
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if(q.eventsOff) this.eventsOff = q.eventsOff;
    if(q.defaultTask) this.defaultTask = q.defaultTask;

    return this;
  }
  get className(){
    return 'SLVExport';
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  make(){
    this._model_ = this._getSLVImage();

    return [{
      content: this.getSLVCode(),
      pathSuffix: '.slv',
      type: 'text'
    }];
  }
  /**
   * Creates model image by nesessary components based on space.
   * @param {string} targetSpace - Model image to update.
   *
   * @return {undefined}
   */
  _getSLVImage(){
    // creates empty model image
    let model = {
      population: this.namespace
    };

    // push active processes
    model.processes = [];
    model.population
      .toArray()
      .filter((x) => {
        return x.instanceOf('Process')
          && x.actors.length>0 // process with actors
          && x.actors.some((actor) => { // true if there is at least non boundary target
            return !actor.targetObj.boundary && !actor.targetObj.isRule;
          });
      })
      .forEach((process) => model.processes.push(process));
    // push non boundary ode variables which are mentioned in processes
    model.variables = [];
    model.population
      .toArray()
      .filter((x) => x.instanceOf('Record') && x.isDynamic)
      .forEach((record) => model.variables.push(record));
    // create matrix
    model.matrix = [];
    model.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor.targetObj.boundary
          && !actor.targetObj.isRule;
      }).forEach((actor) => {
        let variableNum = model.variables.indexOf(actor.targetObj);
        model.matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS
    model.rhs = model.population
      .sortExpressionsByContext('ode_')
      .filter((record) => record.instanceOf('Record') && _.has(record, 'assignments.ode_'));
    // check that all record in start are not Expression
    let startExpressions = model.population
      .selectRecordsByContext('start_')
      .filter((record) => record.assignments.start_.num===undefined); // check if it is not Number
    if (startExpressions.length > 0) {
      let errorMsg = 'DBSolve does not support expressions string in InitialValues.\n'
        + startExpressions
          .map((x) => `${x.index} []= ${x.assignments.start_.expr}`)
          .join('\n');
      this.logger.error(errorMsg, 'ExportError');
    }

    // create TimeEvents
    model.events = [];
    model.population
      .selectByClassName('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = switcher.periodObj === undefined || _.get(switcher, 'repeatCountObj.num') === 0
          ? 0
          : switcher.getPeriod();
        model.population
          .selectRecordsByContext(switcher.id)
          .forEach((record) => { // scan for records in switch
            let expression = record.assignments[switcher.id];
            let [multiply, add] = expression
              .linearizeFor(record.id)
              .map((tree) => {
                if (tree.isSymbolNode) { // a is symbol case, i.e. 'p1'
                  return tree.toString();
                } else {
                  try { // a can be evaluated, i.e. '3/4'
                    return tree.eval();
                  } catch (e) { // other cases, i.e. 'p1*2'
                    this.logger.error(`SLVExport cannot export expression "${record.id} [${switcher.id}]= ${expression.expr}". Use only expressions of type: 'a * ${record.id} + b'`, 'ExportError');
                  }
                }
              });

            model.events.push({
              start: switcher.getStart(),
              period: period,
              on: switcher.id + '_',
              target: record.id,
              multiply: multiply,
              add: add
            });

            if (switcher.stopObj!==undefined){
              model.events.push({
                start: switcher.getStop(),
                period: 0,
                on: 1,
                target: switcher.id + '_',
                multiply: 0,
                add: 0
              });
            }

          });
      });

    // search for CondSwitcher
    let bagSwitchers = model.population
      .selectByClassName('CondSwitcher')
      .map((switcher) => switcher.id);
    if(bagSwitchers.length > 0){
      this.logger.error('CondSwitcher is not supported in SLVExport: ' + bagSwitchers, 'ExportError');
    }
    
    return model;
  }
  getSLVCode(){
    return nunjucks.render(
      'blocks-template.slv.njk',
      this
    );
  }
  toQ(options = {}){
    let res = super.toQ(options);
    if(this.eventsOff) res.eventsOff = this.eventsOff;
    if(this.defaultTask) res.defaultTask = this.defaultTask;
    
    return res;
  }
}

SLVExport._requirements = { };

Container.prototype.exports.SLV = SLVExport;

module.exports = {
  SLVExport
};
