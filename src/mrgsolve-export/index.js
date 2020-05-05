const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('../nunjucks-env');
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
    this.logger.reset();
    this._model_ = this._getMrgsolveImage();

    return [{
      content: this.getMrgsolveCode(),
      pathSuffix: '.cpp',
      type: 'text'
    }];
  }
  _getMrgsolveImage(){
    let model = {
      population: this.namespace
    };

    // set dynamic variables
    model.dynamics = model.population
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.isDynamic;
      });
    let dynamicIds = model.dynamics
      .map((component) => component.id);

    // check if initials depends on dynamic initials, than stop
    model.population
      .toArray()
      .filter((component) => {
        return component.instanceOf('Record')
          && component.assignments 
          && component.assignments.start_;
      }).forEach((record) => {
        let deps = record.dependOn('start_', true);
        let diff = _.intersection(dynamicIds, deps);
        if (diff.length > 0) {
          let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
            + `${record.id}$${record.space} []= ${record.assignments.start_.expr}`;
            
          this.logger.error(errorMsg, 'ExportError');
        }
      });

    // set array of output records
    model.output = model.population
      .toArray()
      .filter((component) => component.instanceOf('Record') && component.assignments!==undefined)
      .filter((component) => !component.instanceOf('Species') || !component.isAmount);

    // set sorted array of initials
    model.start_ = model.population
      .sortExpressionsByContext('start_')
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.start_;
      });

    // set sorted array of rules
    model.ode_ = model.population
      .sortExpressionsByContext('ode_', true)
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.ode_;
      });

    return model;
  }
  getMrgsolveCode(){
    return nunjucks.render(
      'model.cpp.njk',
      this
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
