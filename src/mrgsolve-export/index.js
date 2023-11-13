const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
require('./expression');
const { ajv, intersection } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class MrgsolveExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = MrgsolveExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'MrgsolveExport';
  }
  get format(){
    return 'Mrgsolve';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  makeText(){
    let logger = this._container.logger;

    // filter namespaces if set
    let selectedNamespaces = [...this._container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName))
      .filter(([spaceName, ns]) => !ns.isAbstract);

    // display that function definition is not supported
    let functionsNames = [...this._container.functionDefStorage.keys()];
    if (functionsNames.length > 0) {
      logger.warn(`"FunctionDef" object: ${functionsNames.join(', ')} are presented in platform but not supported by Mrgsolve export.`);
    }

    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let image = this.getMrgsolveImage(ns);
      var codeContent = this.getMrgsolveCode(image);

      return {
        content: codeContent,
        pathSuffix: `/${spaceName}.cpp`,
        type: 'text'
      };
    });

    var runContent = this.getMrgsolveRun(selectedNamespaces);
    results.push({
      content: runContent,
      pathSuffix: '/run.r',
      type: 'text'
    });

    return results;
  }
  getMrgsolveImage(ns){
    // set dynamic variables
    let dynamicRecords = ns
      .selectByInstanceOf('Record')
      .filter((x) => x.isDynamic);
    let dynamicIds = dynamicRecords
      .map((component) => component.id);

    // check if initials depends on dynamic initials, than stop
    ns.toArray()
      .filter((component) => {
        return component.instanceOf('Record')
          && !component.isRule;
      }).forEach((record) => {
        let deps = record.dependOn('start_', true);
        let diff = intersection(dynamicIds, deps);
        if (diff.length > 0) {
          let logger = ns.container.logger;
          let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
            + `${record.index} .= ${record.assignments.start_.toString()}`;
            
          logger.error(errorMsg, {type: 'ExportError'});
        }
      });

    // set array of output records
    let output = ns
      .selectByInstanceOf('Record')
      .filter((rec) => rec.output) // only output: true
      .filter((rec) => {
        // remove all dynamic records written directly
        return !rec.isDynamic 
          || (rec.instanceOf('Species') && !rec.isAmount);
      });

    // set sorted array of initials
    let initRecords = ns
      .sortExpressionsByContext('start_')
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.start_;
      });

    // set sorted array of rules
    let ruleRecords = ns
      .sortExpressionsByContext('ode_', true)
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.ode_;
      });

    // Time Events
    let timeEvents = ns
      .selectByInstanceOf('_Switcher')
      .filter((switcher) => switcher.className === 'TimeSwitcher')
      .map((switcher) => {
        let assignments = ns
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
    let continuousEvents = ns
      .selectByInstanceOf('_Switcher')
      .filter((switcher) => {
        return switcher.className === 'CSwitcher' 
          || switcher.className === 'DSwitcher';
      })
      .map((switcher) => {
        let assignments = ns
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
      population: ns,
      dynamicRecords,
      initRecords,
      ruleRecords,
      timeEvents,
      continuousEvents,
      output,
      options: this
    };
  }
  getMrgsolveCode(image = {}){
    return compiledTemplates['mrgsolve-model.cpp.njk'].render(image);
  }
  getMrgsolveRun(selectedNamespaces){
    return compiledTemplates['mrgsolve-run.r.njk'].render({selectedNamespaces});
  }
}

module.exports = MrgsolveExport;
