const { Namespace } = require('../namespace');

/**
 * Creates single model image by nesessary components based on space.
 * @param {string} targetSpace - Model image to update.
 *
 * @return {undefined}
 */
Namespace.prototype.getDBSolveImage = function(powTransform, groupConstBy, version) {
  let { logger } = this.container;

  // push active processes
  let processes = this
    .selectByInstanceOf('Process')
    .filter((x) => {
      return x.actors.length > 0 // process with actors
        && x.actors.some((actor) => { // true if there is at least non boundary target
          return !actor.targetObj.boundary && !actor.targetObj.isRule;
        });
    });
  // push non boundary ode variables which are mentioned in processes
  let dynamicRecords = this
    .selectByInstanceOf('Record')
    .filter((x) => x.isDynamic);
  /*
  let staticRecords = this
    .selectByInstanceOf('Record')
    .filter((x) => !x.isDynamic && !x.isRule);
  */
  let initRecords = this
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
  let ruleRecords = this
    .sortExpressionsByContext('ode_', true)
    .filter((x) => x.isDynamic || x.isRule );

  // create TimeEvents
  let timeEvents = [];
  this
    .selectByInstanceOf('TimeSwitcher')
    .forEach((switcher) => { // scan for switch
      // if period===undefined or period===0 => single dose
      // if period > 0 => multiple dose
      let period = switcher.periodObj === undefined || switcher.repeatCountObj?.num === 0
        ? 0
        : switcher.getPeriod();
      this
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
            expr: expr.toSLVString(logger, powTransform)
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
  let discreteEvents = this
    .selectByClassName('DSwitcher')
    .map((switcher) => {
      // check boolean expression in trigger
      if (!switcher.trigger.isComparison) {
        let msg = `DBSolve supports only simple comparison operators in DSwitcher trigger, got: "${switcher.trigger.toString()}"`;
        logger.error(msg, {type: 'ExportError'});
      }       
      
      let assignments = this
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
  let continuousEvents = this
    .selectByClassName('CSwitcher')
    .map((switcher) => {
      // CSWitcher is not supported in DBsolve
      let msg = `DBSolve does not support CSwitcher, got: "${switcher.id}. It will be transformed to DSwitcher"`;
      logger.warn(msg, {type: 'ExportWarning'});

      let assignments = this
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
  this.selectByClassName('Const').forEach((constant) => {
    let key = constant.getProperty(groupConstBy) + '';
    if (!groupedConst.hasOwnProperty(key)) {
      groupedConst[key] = [];
    }
    groupedConst[key].push(constant);
  });

  return {
    population: this,
    dynamicRecords,
    initRecords,
    ruleRecords,
    processes,
    matrix,
    powTransform: powTransform,
    version: version,
    timeEvents,
    discreteEvents,
    continuousEvents,
    groupedConst,
    logger
  };
};