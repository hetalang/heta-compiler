const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');

class DBSolveExport extends _Export{
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if (q.defaultTask) this.defaultTask = q.defaultTask;

    return this;
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  make(){
    let image = this.getSLVImage();

    return [
      {
        content: this.getSLVCode(image),
        pathSuffix: '/model.slv',
        type: 'text'
      }
    ];
  }
  /**
   * Creates model image by nesessary components based on space.
   * @param {string} targetSpace - Model image to update.
   *
   * @return {undefined}
   */
  getSLVImage(){
    // creates model image
    let image = {
      population: this.namespace
    };

    // push active processes
    image.processes = this.namespace
      .selectByInstanceOf('Process')
      .filter((x) => {
        return x.actors.length > 0 // process with actors
          && x.actors.some((actor) => { // true if there is at least non boundary target
            return !actor.targetObj.boundary && !actor.targetObj.isRule;
          });
      });
    // push non boundary ode variables which are mentioned in processes
    image.dynamicRecords = this.namespace
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    /*
    image.staticRecords = this.namespace
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
    */
    image.initRecords = this.namespace // XXX: do we need this?
      .sortExpressionsByContext('start_', true)
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule)); 
    // create matrix
    image.matrix = [];
    image.processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor.targetObj.boundary
          && !actor.targetObj.isRule;
      }).forEach((actor) => {
        let variableNum = image.dynamicRecords.indexOf(actor.targetObj);
        image.matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS (rules)
    image.ruleRecords = this.namespace
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.instanceOf('Species') || x.isRule );

    // create TimeEvents
    image.events = [];
    this.namespace
      .selectByClassName('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = switcher.periodObj === undefined || _.get(switcher, 'repeatCountObj.num') === 0
          ? 0
          : switcher.getPeriod();
        this.namespace
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
                    this.logger.error(`DBSolveExport cannot export expression "${record.id} [${switcher.id}]= ${expression.expr}". Use only expressions of type: 'a * ${record.id} + b'`, 'ExportError');
                  }
                }
              });

            image.events.push({
              start: switcher.getStart(),
              period: period,
              on: switcher.id + '_',
              target: record.id,
              multiply: multiply,
              add: add
            });

            if (switcher.stopObj !== undefined){
              image.events.push({
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
    let bagSwitchers = this.namespace
      .selectByClassName('CondSwitcher')
      .map((switcher) => switcher.id);
    if (bagSwitchers.length > 0) {
      this.logger.error('CondSwitcher is not supported in format DBSolve: ' + bagSwitchers, 'ExportError');
    }
    
    image.powTransform = this.powTransform;

    return image;
  }
  getSLVCode(image = {}){
    return nunjucks.render(
      'model.slv.njk',
      image
    );
  }
}

Container.prototype.exports.DBSolve = DBSolveExport;

module.exports = {
  DBSolveExport
};
