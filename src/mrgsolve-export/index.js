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
    } else {
      this.spaceFilter = ['nameless'];
    }
  }
  get className(){
    return 'MrgsolveExport';
  }
  get format(){
    return 'Mrgsolve'
  }
  static get validate(){
    return ajv.compile(schema);
  }
  make(){
    // use only one namespace
    let logger = this._container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for Mrgsolve format should include at least one namespace but get empty';
      logger.err(msg);
      var codeContent = '';
      var runContent = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      codeContent = '';
      runContent = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `Mrgsolve format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);
      let image = this.getMrgsolveImage(ns);
      codeContent = this.getMrgsolveCode(image);
      runContent = this.getMrgsolveRun(image);
    }

    return [
      {
        content: codeContent,
        pathSuffix: '/model.cpp',
        type: 'text'
      },
      {
        content: runContent,
        pathSuffix: '/run.r',
        type: 'text'
      }
    ];
  }
  getMrgsolveImage(ns){
    // set dynamic variables
    let dynamics = ns
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.isDynamic;
      });
    let dynamicIds = dynamics
      .map((component) => component.id);

    // check if initials depends on dynamic initials, than stop
    ns
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record')
          && component.assignments 
          && component.assignments.start_;
      }).forEach((record) => {
        let deps = record.dependOn('start_', true);
        let diff = _.intersection(dynamicIds, deps);
        if (diff.length > 0) {
          let logger = ns.container.logger;
          let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
            + `${record.id}$${record.space} []= ${record.assignments.start_.toString()}`;
            
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
    let start_ = ns
      .sortExpressionsByContext('start_')
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.start_;
      });

    // set sorted array of rules
    let ode_ = ns
      .sortExpressionsByContext('ode_', true)
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.ode_;
      });

    return {
      population: ns,
      dynamics,
      output,
      start_,
      ode_,
      options: this
    };
  }
  getMrgsolveCode(image = {}){
    return nunjucks.render(
      'mrgsolve-model.cpp.njk',
      image
    );
  }
  getMrgsolveRun(image = {}){
    return nunjucks.render(
      'mrgsolve-run.r.njk',
      image
    );
  }
}

module.exports = MrgsolveExport;
