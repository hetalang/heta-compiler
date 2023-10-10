const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
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
  makeText(){
    let logger = this._container.logger;

    if (this.spaceFilter !== undefined) {
      // empty namespace is not allowed
      if (this.spaceFilter.length === 0) {
        let msg = 'spaceFilter for SLV format should include at least one namespace, got empty.';
        logger.error(msg);
        return []; // BRAKE
      }

      // check if namespaces exists
      let lostNamespaces = this.spaceFilter.filter((x) => {
        let ns = this._container.namespaceStorage.get(x);
        return !ns || ns.isAbstract;
      });

      if (lostNamespaces.length > 0) {
        let msg = `Namespaces: ${lostNamespaces.join(', ')} either do not exist or are abstract. Simbio export stopped.`;
        logger.error(msg);
        return []; // BRAKE
      }
    }

    // display that function definition is not supported
    let functionsNames = [...this._container.functionDefStorage.keys()];
    if (functionsNames.length > 0) {
      logger.warn(`"FunctionDef" object: ${functionsNames.join(', ')} are presented in platform but not supported by SLV export.`);
    }

    // filter namespaces if set
    let selectedNamespaces = this.spaceFilter !== undefined 
      ? [...this._container.namespaceStorage].filter((x) => this.spaceFilter.indexOf(x[0]) !== -1)
      : [...this._container.namespaceStorage].filter((x) => !x[1].isAbstract);

    let results = selectedNamespaces.map((x) => {
      let spaceName = x[0];
      let ns = x[1];

      let image = this.getSLVImage(ns);
      let content = this.getSLVCode(image);
        
      return {
        content: content,
        pathSuffix: `/${spaceName}.slv`,
        type: 'text'
      };
    });

    return results;
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
      .sortExpressionsByContext('ode_', false)
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

    // DEvents
    let dSwitchers = ns
      .selectByClassName('DSwitcher')
      .map((x) => x.id);
    if (dSwitchers.length > 0) {
      let msg = `SLV doesn't support @DSwitchers: ${dSwitchers.join(', ')}.`;
      logger.error(msg, {type: 'ExportError'});
    }

    // CEvents
    let cSwitchers = ns
      .selectByClassName('CSwitcher')
      .map((x) => x.id);
    if (cSwitchers.length > 0) {
      let msg = `SLV doesn't support @CSwitchers: ${cSwitchers.join(', ')}.`;
      logger.error(msg, {type: 'ExportError'});
    }

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
      groupedConst: groupedConst,
      powTransform: this.powTransform
    };
  }
  getSLVCode(image = {}){
    console.log
    return compiledTemplates['slv-blocks-template.slv.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SLVExport;
