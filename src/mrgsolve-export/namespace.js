const { Namespace } = require('../namespace');
require('./expression');
const { intersection } = require('../utils');

Namespace.prototype.getMrgsolveImage = function() {
  // set dynamic variables
  let dynamicRecords = this
    .selectByInstanceOf('Record')
    .filter((x) => x.isDynamic);
  let dynamicIds = dynamicRecords
    .map((component) => component.id);

  // check if initials depends on dynamic initials, than stop
  this.toArray()
    .filter((component) => {
      return component.instanceOf('Record')
        && !component.isRule;
    }).forEach((record) => {
      let deps = record.dependOn('start_', true);
      let diff = intersection(dynamicIds, deps);
      if (diff.length > 0) {
        let logger = this.container.logger;
        let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
          + `${record.index} .= ${record.assignments.start_.toString()}`;
          
        logger.error(errorMsg, {type: 'ExportError'});
      }
    });

  // set array of output records
  let output = this
    .selectByInstanceOf('Record')
    .filter((rec) => rec.output) // only output: true
    .filter((rec) => {
      // remove all dynamic records written directly
      return !rec.isDynamic 
        || (rec.instanceOf('Species') && !rec.isAmount);
    });

  // set sorted array of initials
  let initRecords = this
    .sortExpressionsByContext('start_')
    .filter((component) => {
      return component.instanceOf('Record') 
        && component.assignments 
        && component.assignments.start_;
    });

  // set sorted array of rules
  let ruleRecords = this
    .sortExpressionsByContext('ode_', true)
    .filter((component) => {
      return component.instanceOf('Record') 
        && component.assignments 
        && component.assignments.ode_;
    });

  // Time Events
  let timeEvents = this
    .selectByInstanceOf('_Switcher')
    .filter((switcher) => switcher.className === 'TimeSwitcher')
    .map((switcher) => {
      let assignments = this
        .selectRecordsByContext(switcher.id)
        .map((record) => {
          let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
            ? record.getAssignment(switcher.id).multiply(record.compartment)
            : record.getAssignment(switcher.id);

          // find number of dynamic record (compartment)
          // -1 means non-dynamic
          let num = dynamicIds.indexOf(record.id);

          return {
            target: record.id,
            expr,
            num
          };
        });
        
      return {
        switcher,
        assignments
      };
    });

  // Continuous Events
  let continuousEvents = this
    .selectByInstanceOf('_Switcher')
    .filter((switcher) => {
      return switcher.className === 'CSwitcher' 
        || switcher.className === 'DSwitcher';
    })
    .map((switcher) => {
      let assignments = this
        .selectRecordsByContext(switcher.id)
        .map((record) => {
          let expr = record.isDynamic && record.instanceOf('Species') && !record.isAmount
            ? record.getAssignment(switcher.id).multiply(record.compartment)
            : record.getAssignment(switcher.id);

          // find number of dynamic record (compartment)
          // -1 means non-dynamic
          let num = dynamicIds.indexOf(record.id);

          return {
            target: record.id,
            expr,
            num
          };
        });
        
      return {
        switcher,
        assignments
      };
    });

  return {
    population: this,
    dynamicRecords,
    initRecords,
    ruleRecords,
    timeEvents,
    continuousEvents,
    output
  };
};