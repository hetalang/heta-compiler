const { Namespace } = require('../namespace');

/**
 * Creates model image by necessary components based on space.
 * @param {string} ns - Model image to update.
 *
 * @return {undefined}
 */
Namespace.prototype.getSLVImage = function(groupConstBy, powTransform, version) {
  let { logger } = this.container;

  // push active processes
  let processes = [];
  this
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
  this
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
  let rhs = this
    .sortExpressionsByContext('ode_', false)
    .filter((record) => record.instanceOf('Record') && record.assignments?.ode_ !== undefined);
  // check that all record in start are not Expression
  let startExpressions = this
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
  this
    .selectByClassName('TimeSwitcher')
    .forEach((switcher) => { // scan for switch
      // if period===undefined or period===0 => single dose
      // if period > 0 => multiple dose
      let period = switcher.periodObj === undefined || switcher.repeatCountObj?.num === 0
        ? 0
        : switcher.getPeriod();
      this
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
  let dSwitchers = this
    .selectByClassName('DSwitcher')
    .map((x) => x.id);
  if (dSwitchers.length > 0) {
    let msg = `SLV doesn't support @DSwitchers, got ${dSwitchers.join(', ')}.`;
    logger.error(msg, {type: 'ExportError'});
  }

  // CEvents
  let cSwitchers = this
    .selectByClassName('CSwitcher')
    .map((x) => x.id);
  if (cSwitchers.length > 0) {
    let msg = `SLV doesn't support @CSwitchers, got ${cSwitchers.join(', ')}.`;
    logger.error(msg, {type: 'ExportError'});
  }

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
    processes,
    variables,
    matrix,
    rhs,
    events: timeEvents,
    groupedConst: groupedConst,
    powTransform: powTransform,
    version: version,
  };
};