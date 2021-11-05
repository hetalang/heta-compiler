const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    eventsOff: {type: 'boolean'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
  }
};

class SLVExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = SLVExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.powTransform = q.powTransform ? q.powTransform : 'keep';
    if (q.groupConstBy) {
      this.groupConstBy = q.groupConstBy;
    } else {
      this.groupConstBy = 'tags[0]';
    }
    if (q.eventsOff) this.eventsOff = q.eventsOff;
    if (q.defaultTask) this.defaultTask = q.defaultTask;
    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    } else {
      this.spaceFilter = ['nameless'];
    }
  }
  get className(){
    return 'SLVExport';
  }
  get format(){
    return 'SLV';
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
      let msg = 'spaceFilter for SLV format should include at least one namespace, got empty.';
      logger.error(msg);
      var content = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.error(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `SLV format does not support multi-space export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);
      let image = this.getSLVImage(ns);
      content = this.getSLVCode(image);
    }

    return [{
      content: content,
      pathSuffix: '.slv',
      type: 'text'
    }];
  }
  /**
   * Creates model image by necessary components based on space.
   * @param {string} ns - Model image to update.
   *
   * @return {undefined}
   */
  getSLVImage(ns){
    let logger = this._container.logger;

    // push active processes
    let processes = [];
    ns
      .toArray()
      .filter((x) => {
        return x.instanceOf('Process')
          && x.actors.length>0 // process with actors
          && x.actors.some((actor) => { // true if there is at least non boundary target
            return !actor.targetObj.boundary && !actor.targetObj.isRule;
          });
      })
      .forEach((process) => processes.push(process));
    // push non boundary ode variables which are mentioned in processes
    let variables = [];
    ns
      .toArray()
      .filter((x) => x.instanceOf('Record') && x.isDynamic)
      .forEach((record) => variables.push(record));
    // create matrix
    let matrix = [];
    processes.forEach((process, processNum) => {
      process.actors.filter((actor) => {
        return !actor.targetObj.boundary
          && !actor.targetObj.isRule;
      }).forEach((actor) => {
        let variableNum = variables.indexOf(actor.targetObj);
        matrix.push([processNum, variableNum, actor.stoichiometry]);
      });
    });

    // create and sort expressions for RHS
    let rhs = ns
      .sortExpressionsByContext('ode_')
      .filter((record) => record.instanceOf('Record') && _.has(record, 'assignments.ode_'));
    // check that all record in start are not Expression
    let startExpressions = ns
      .selectRecordsByContext('start_')
      .filter((record) => record.assignments.start_.num === undefined); // check if it is not Number
    if (startExpressions.length > 0) {
      let errorMsg = 'SLV does not support expressions string in InitialValues.\n'
        + startExpressions
          .map((x) => `${x.index} []= ${x.assignments.start_.toString()}`)
          .join('\n');
      logger.error(errorMsg, {type: 'ExportError'});
    }

    // create TimeEvents
    let timeEvents = [];
    ns
      .selectByClassName('TimeSwitcher')
      .forEach((switcher) => { // scan for switch
        // if period===undefined or period===0 or repeatCount===0 => single dose
        // if period > 0 and (repeatCount > 0 or repeatCount===undefined) => multiple dose
        let period = switcher.periodObj === undefined || _.get(switcher, 'repeatCountObj.num') === 0
          ? 0
          : switcher.getPeriod();
        ns
          .selectRecordsByContext(switcher.id)
          .forEach((record) => { // scan for records in switch
            let expression = record.assignments[switcher.id];
            let [multiply, add] = expression
              .linearizeFor(record.id)
              .map((tree) => {
                if (tree.type === 'SymbolNode') { // a is symbol case, i.e. 'p1'
                  return tree.toString();
                } else {
                  try { // a can be evaluated, i.e. '3/4'
                    return tree.evaluate();
                  } catch (e) { // other cases, i.e. 'p1*2'
                    logger.error(`SLV format cannot export expression "${record.id} [${switcher.id}]= ${expression.toString()}". Use only expressions of type: 'a * ${record.id} + b'`, {type: 'ExportError'});
                  }
                }
              });

            timeEvents.push({
              start: switcher.getStart(),
              period: period,
              on: switcher.id + '_',
              target: record.id,
              multiply: multiply,
              add: add
            });
          });
        // transform `stop` to `event`
        if (switcher.stopObj !== undefined) {
          timeEvents.push({
            start: switcher.getStop(),
            period: 0,
            on: 1,
            target: switcher.id + '_',
            multiply: 0,
            add: 0
          });
        }
      });

    // Discrete Events
    let discreteEvents = ns
      .selectByClassName('DSwitcher')
      .map((switcher) => {
        // check boolean expression in trigger
        if (!switcher.trigger.isComparison) {
          let msg = `SLV supports only simple comparison operators in DSwitcher trigger, got: "${switcher.trigger.toString()}"`;
          logger.error(msg, {type: 'ExportError'});
        }       
        
        let assignments = ns
          .selectRecordsByContext(switcher.id);
          
        // unsupported events for dynamic
        let dynamicRecords = assignments
          .filter((record) => record.isDynamic)
          .map((record) => record.index);
        if (dynamicRecords.length > 0) {
          let msg = `SLV doesn't support ${switcher.className} for dynamic records: ${dynamicRecords.join(', ')}.`;
          logger.error(msg, {type: 'ExportError'});
        }
        
        return {
          switcher,
          assignments
        };
      });

    // Continuous Events
    let continuousEvents = ns
      .selectByClassName('CSwitcher')
      .map((switcher) => {
        let assignments = ns
          .selectRecordsByContext(switcher.id);

        // unsupported events for dynamic
        let dynamicRecords = assignments
          .filter((record) => record.isDynamic)
          .map((record) => record.index);
        if (dynamicRecords.length > 0) {
          let msg = `SLV doesn't support ${switcher.className} for dynamic records: ${dynamicRecords.join(', ')}.`;
          logger.error(msg, {type: 'ExportError'});
        }

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
      processes,
      variables,
      matrix,
      rhs,
      events: timeEvents,
      discreteEvents,
      continuousEvents,
      groupedConst: groupedConst,
      powTransform: this.powTransform
    };
  }
  getSLVCode(image = {}){
    return nunjucks.render(
      'slv-blocks-template.slv.njk',
      image
    );
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SLVExport;
