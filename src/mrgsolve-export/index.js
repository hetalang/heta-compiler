const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');
const { ajv } = require('../utils');

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

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }
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
  make(){
    let logger = this._container.logger;

    if (this.spaceFilter !== undefined) {
      // empty namespace is not allowed
      if (this.spaceFilter.length === 0) {
        let msg = 'spaceFilter for Mrgsolve format should include at least one namespace, got empty.';
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

    // filter namespaces if set
    let selectedNamespaces = this.spaceFilter !== undefined 
      ? [...this._container.namespaceStorage].filter((x) => this.spaceFilter.indexOf(x[0]) !== -1)
      : [...this._container.namespaceStorage].filter((x) => !x[1].isAbstract);

    let results = selectedNamespaces.map((x) => {
      let spaceName = x[0];
      let ns = x[1];

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
        let diff = _.intersection(dynamicIds, deps);
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
    return nunjucks.render(
      'mrgsolve-model.cpp.njk',
      image
    );
  }
  getMrgsolveRun(selectedNamespaces){
    return nunjucks.render(
      'mrgsolve-run.r.njk',
      {selectedNamespaces}
    );
  }
}

module.exports = MrgsolveExport;
