const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
const _get = require('lodash/get');
require('./expression');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
    version: {enum: ['25', '26', 25, 26]},
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

    this.version = q.version ? q.version + '' : '26'; // force string
    
    if (q.defaultTask) this.defaultTask = q.defaultTask;
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
      logger.warn(`"FunctionDef" object: ${functionsNames.join(', ')} are presented in platform but not supported by DBSolve export.`);
    }

    // filter namespaces if set
    let selectedNamespaces = [...this._container.namespaceStorage]
      .filter(([spaceName, space]) => new RegExp(this.spaceFilter).test(spaceName))
      .filter(([spaceName, space]) => !space.isAbstract);

    let results = selectedNamespaces.map(([spaceName, namespace]) => {
      let image = this.getSLVImage(namespace);
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
   * Creates single model image by nesessary components based on space.
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
      .filter((x) => {
        return x.instanceOf('Record') 
          && (x.assignments?.start_ !== undefined || x.isRule);
      }); 
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
        let period = switcher.periodObj === undefined || switcher.repeatCountObj?.num === 0
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
              targetObj: record,
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
        let assignments = ns
          .selectRecordsByContext(switcher.id)
          .map((record) => {
            let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
              ? record.getAssignment(switcher.id).multiply(record.compartment)
              : record.getAssignment(switcher.id);

            return {
              targetObj: record,
              expr: expr
            };
          });
          
        return {
          switcher,
          assignments
        };
      });
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
      dynamicRecords,
      initRecords,
      ruleRecords,
      processes,
      matrix,
      powTransform: this.powTransform,
      version: this.version,
      timeEvents,
      discreteEvents,
      continuousEvents,
      groupedConst,
    };
  }
  getSLVCode(image = {}){
    return compiledTemplates['dbsolve-model.slv.njk'].render(image);
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
