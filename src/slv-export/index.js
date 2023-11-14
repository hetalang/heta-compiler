const { AbstractExport } = require('../abstract-export');
/* global compiledTemplates */
const _get = require('lodash/get');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    eventsOff: {type: 'boolean'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
    version: {enum: ['25', '26', 25, 26]},
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
    this.version = q.version ? q.version + '' : '26'; // force string
  }
  get className(){
    return 'SLVExport';
  }
  get defaultFilepath() {
    return 'slv';
  }
  get format(){
    return 'SLV';
  }
  get requireConcrete() {
    return true;
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  makeText(){
    let logger = this._container.logger;

    // display that function definition is not supported
    let functionsNames = [...this._container.functionDefStorage.keys()];
    if (functionsNames.length > 0) {
      logger.warn(`"FunctionDef" object: ${functionsNames.join(', ')} are presented in platform but not supported by SLV export.`);
    }

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
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
      .filter((record) => record.instanceOf('Record') && record.assignments?.ode_ !== undefined);
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
        let period = switcher.periodObj === undefined || switcher.repeatCountObj?.num === 0
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

    // group Const, instead of groupBy
    let groupedConst = {}; // {group1: [const1, const2], group2: [const3, const4]}
    ns.selectByClassName('Const').forEach((constant) => {
      let key = _get(constant, this.groupConstBy) + '';
      if (!groupedConst.hasOwnProperty(key)) {
        groupedConst[key] = [];
      }
      groupedConst[key].push(constant);
    });
    
    return {
      population: ns,
      processes,
      variables,
      matrix,
      rhs,
      events: timeEvents,
      groupedConst: groupedConst,
      powTransform: this.powTransform,
      version: this.version,
    };
  }
  getSLVCode(image = {}){
    return compiledTemplates['slv-blocks-template.slv.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SLVExport;
