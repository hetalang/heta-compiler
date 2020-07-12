const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const _ = require('lodash');
require('./expression');

class MrgsolveExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'MrgsolveExport';
  }
  make(){
    let image = this.getMrgsolveImage();

    return [{
      content: this.getMrgsolveCode(image),
      pathSuffix: '.cpp',
      type: 'text'
    }];
  }
  getMrgsolveImage(){
    let population = this.namespace;

    // set dynamic variables
    let dynamics = population
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.isDynamic;
      });
    let dynamicIds = dynamics
      .map((component) => component.id);

    // check if initials depends on dynamic initials, than stop
    population
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record')
          && component.assignments 
          && component.assignments.start_;
      }).forEach((record) => {
        let deps = record.dependOn('start_', true);
        let diff = _.intersection(dynamicIds, deps);
        if (diff.length > 0) {
          let logger = this.namespace.container.logger;
          let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
            + `${record.id}$${record.space} []= ${record.assignments.start_.toString()}`;
            
          logger.error(errorMsg, 'ExportError');
        }
      });

    // set array of output records
    let output = population
      .selectByInstanceOf('Record')
      .filter((rec) => {
        // remove all dynamic records written directly
        return !rec.isDynamic 
          || (rec.instanceOf('Species') && !rec.isAmount);
      });

    // set sorted array of initials
    let start_ = population
      .sortExpressionsByContext('start_')
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.start_;
      });

    // set sorted array of rules
    let ode_ = population
      .sortExpressionsByContext('ode_', true)
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.ode_;
      });

    return {
      population,
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
