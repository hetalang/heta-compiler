const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');

class DBSolveExport extends _Export{
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);

    if (q.groupConstBy) {
      this.groupConstBy = q.groupConstBy;
    } else {
      this.groupConstBy = 'tags[0]';
    }
    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    } else {
      this.spaceFilter = ['nameless'];
    }
    
    if (q.defaultTask) this.defaultTask = q.defaultTask;

    return this;
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  make(){
    // use only one namespace
    let logger = this.container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for DBSolve format should include at least one namespace but get empty';
      logger.err(msg);
      var content = '';
    } else if (!this.container.namespaces.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `DBSolve format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this.container.namespaces.get(this.spaceFilter[0]);
      let image = this.getSLVImage(ns);
      content = this.getSLVCode(image);
    }

    return [
      {
        content: content,
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
  getSLVImage(ns){
    // creates model image
    let image = {
      population: ns
    };

    // push active processes
    image.processes = ns
      .selectByInstanceOf('Process')
      .filter((x) => {
        return x.actors.length > 0 // process with actors
          && x.actors.some((actor) => { // true if there is at least non boundary target
            return !actor.targetObj.boundary && !actor.targetObj.isRule;
          });
      });
    // push non boundary ode variables which are mentioned in processes
    image.dynamicRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    /*
    image.staticRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
    */
    image.initRecords = ns // XXX: do we need this?
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
    image.ruleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.isDynamic || x.isRule );

    // create TimeEvents
    image.events = [];
    image.eventCounter = 0;
    ns
      .selectByInstanceOf('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = switcher.periodObj === undefined || _.get(switcher, 'repeatCountObj.num') === 0
          ? 0
          : switcher.getPeriod();
        ns
          .selectRecordsByContext(switcher.id)
          .forEach((record) => { // scan for records in switch
            let expr = record.instanceOf('Species') && !record.isAmount
              ? record.getAssignment(switcher.id).multiply(record.compartment)
              : record.getAssignment(switcher.id);

            let evt = {
              start: switcher.getStart(),
              period: period,
              on: switcher.id + '_',
              target: record.id + '_',
              multiply: 0,
              add: record.id + '_' + switcher.id + '_',
              expr: expr.toSLVString(this.powTransform)
            };

            image.events.push(evt);
            image.eventCounter++;

            if (switcher.stopObj !== undefined) {
              evt.hasStop = true;
              evt.startStop = switcher.getStop();
              image.eventCounter++;
            }
          });
      });

    // search for CSwitcher
    let bagSwitchers = ns
      .selectByClassName('CSwitcher')
      .map((switcher) => switcher.id);
    if (bagSwitchers.length > 0) {
      let logger = this.container.logger;
      logger.error('CSwitcher is not supported in format DBSolve: ' + bagSwitchers, 'ExportError');
    }
    
    image.powTransform = this.powTransform;

    // group Const
    image.grouppedConst = _.groupBy(
      ns.selectByClassName('Const'),
      (con) => _.get(con, this.groupConstBy)
    );

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
