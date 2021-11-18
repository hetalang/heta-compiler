const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
  }
};

class DBSolveExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = DBSolveExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.powTransform = q.powTransform ? q.powTransform : 'keep';
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
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  make(){
    // use only one namespace
    let logger = this._container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for DBSolve format should include at least one namespace, got empty.';
      logger.error(msg);
      var content = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.error(msg);
      content = '';
    } else if (this._container.namespaceStorage.get(this.spaceFilter[0]).isAbstract) { // if abstract
      let msg = `Abstract Namespace "${this.spaceFilter[0]}" cannot be used for DBSolve export.`;
      logger.error(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `DBSolve format does not support multi-space export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);
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
    let logger = this._container.logger;

    // push active processes
    let processes = ns
      .selectByInstanceOf('Process')
      .filter((x) => {
        return x.actors.length > 0 // process with actors
          && x.actors.some((actor) => { // true if there is at least non boundary target
            return !actor.targetObj.boundary && !actor.targetObj.isRule;
          });
      });
    // push non boundary ode variables which are mentioned in processes
    let dynamicRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    /*
    let staticRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => !x.isDynamic && !x.isRule);
    */
    let initRecords = ns
      .sortExpressionsByContext('start_', true)
      .filter((x) => x.instanceOf('Record') && (_.has(x, 'assignments.start_') || x.isRule)); 
    // create matrix
    let matrix = [];
    processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor.targetObj.boundary
          && !actor.targetObj.isRule;
      }).forEach((actor) => {
        let variableNum = dynamicRecords.indexOf(actor.targetObj);
        matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS (rules)
    let ruleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((x) => x.isDynamic || x.isRule );

    // create TimeEvents
    let timeEvents = [];
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
            let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
              ? record.getAssignment(switcher.id).multiply(record.compartment)
              : record.getAssignment(switcher.id);

            let evt = {
              start: switcher.getStart(),
              period: period,
              on: switcher.id + '_',
              target: record.id + (record.isDynamic ? '_' : ''),
              multiply: 0,
              add: record.id + '_' + switcher.id + '_',
              expr: expr.toSLVString(this.powTransform)
            };
            timeEvents.push(evt);
          });

        // transform `stop` to `event`
        if (switcher.stopObj !== undefined) {
          let evt = {
            start: switcher.getStop(),
            period: 0,
            on: 1,
            target: switcher.id + '_',
            multiply: 0,
            add: 0,
            isStop: true // if false then do not put in RHS
          };
          timeEvents.push(evt);
        }
      });

    // Discrete Events
    let discreteEvents = ns
      .selectByClassName('DSwitcher')
      .map((switcher) => {
        let dynamicRecords = ns
          .selectRecordsByContext(switcher.id)
          .filter((record) => record.isDynamic)
          .map((record) => record.index);
        if (dynamicRecords.length > 0) {
          let msg = `DBSolve doesn't support ${switcher.className} for dynamic records: ${dynamicRecords.join(', ')}.`;
          logger.error(msg, {type: 'ExportError'});
        }
        
        // check boolean expression in trigger
        if (!switcher.trigger.isComparison) {
          let msg = `DBSolve supports only simple comparison operators in DSwitcher trigger, got: "${switcher.trigger.toString()}"`;
          logger.error(msg, {type: 'ExportError'});
        }       
        
        let assignments = ns
          .selectRecordsByContext(switcher.id)
          .map((record) => {
            let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
              ? record.getAssignment(switcher.id).multiply(record.compartment)
              : record.getAssignment(switcher.id);

            return {
              target: record.id + (record.isDynamic ? '_' : ''),
              expr: expr
            };
          });
          
        return {
          switcher,
          assignments
        };
      });

    // Continuous Events
    let continuousEvents = ns
      .selectByClassName('CSwitcher')
      .map((switcher) => {
        let dynamicRecords = ns
          .selectRecordsByContext(switcher.id)
          .filter((record) => record.isDynamic)
          .map((record) => record.index);
        if (dynamicRecords.length > 0) {
          let msg = `DBSolve doesn't support ${switcher.className} for dynamic records: ${dynamicRecords.join(', ')}.`;
          logger.error(msg, {type: 'ExportError'});
        }

        let assignments = ns
          .selectRecordsByContext(switcher.id)
          .map((record) => {
            let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
              ? record.getAssignment(switcher.id).multiply(record.compartment)
              : record.getAssignment(switcher.id);

            return {
              target: record.id + (record.isDynamic ? '_' : ''),
              expr: expr
            };
          });
          
        return {
          switcher,
          assignments
        };
      });
    // group Const
    let groupedConst = _.groupBy(
      ns.selectByClassName('Const'),
      (con) => _.get(con, this.groupConstBy)
    );

    return {
      population: ns,
      dynamicRecords,
      initRecords,
      ruleRecords,
      processes,
      matrix,
      powTransform: this.powTransform,
      timeEvents,
      discreteEvents,
      continuousEvents,
      groupedConst
    };
  }
  getSLVCode(image = {}){
    return nunjucks.render(
      'dbsolve-model.slv.njk',
      image
    );
  }
  get className(){
    return 'DBSolveExport';
  }
  get format(){
    return 'DBSolve';
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = DBSolveExport;
