const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');

class MrgsolveExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    } else {
      this.spaceFilter = ['nameless'];
    }

    return this;
  }
  get className(){
    return 'MrgsolveExport';
  }
  make(){
    // use only one namespace
    let logger = this.container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for SBML format should include at least one namespace but get empty';
      logger.err(msg);
      var content = '';
    } else if (!this.container.namespaces.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `SBML format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this.container.namespaces.get(this.spaceFilter[0]);
      let image = this.getMrgsolveImage(ns);
      content = this.getMrgsolveCode(image);
    }

    return [{
      content: content,
      pathSuffix: '.cpp',
      type: 'text'
    }];
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
            
          logger.error(errorMsg, 'ExportError');
        }
      });

    // set array of output records
    let output = ns
      .selectByInstanceOf('Record')
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
      'model.cpp.njk',
      image
    );
  }
  toQ(options = {}){
    let res = super.toQ(options);

    return res;
  }
}

MrgsolveExport._requirements = { };

Container.prototype.exports.Mrgsolve = MrgsolveExport;

module.exports = {
  MrgsolveExport
};
