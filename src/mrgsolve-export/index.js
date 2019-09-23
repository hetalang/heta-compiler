const Container = require('../container');
const { _Export } = require('../core/_export');
//const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
//const XArray = require('../x-array');
const _ = require('lodash');

class MrgsolveExport extends _Export{
  merge(q, skipChecking){
    super.merge(q, skipChecking);
    if(q && q.model===undefined){
      throw new TypeError(`"model" property in MrgsolveExport ${this.id} should be declared.`);
    }
    this.model = q.model;

    return this;
  }
  get className(){
    return 'MrgsolveExport';
  }
  get ext(){
    return 'cpp';
  }
  do(){
    this._model_ = this._getMrgsolveImage(this.model);
    return this.getMrgsolveCode();
  }
  _getMrgsolveImage(targetSpace){
    let model = {
      population: this._container.getPopulation(targetSpace, false)
    };

    // set dynamic variables
    model.dynamics = model.population
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.isDynamic;
      });
    let dynamicIds = model.dynamics
      .map((component) => component.id);

    // check if initials depends on dynamic initials, than stop
    model.population
      .filter((component) => {
        return component.instanceOf('Record')
          && component.assignments 
          && component.assignments.start_;
      }).forEach((record) => {
        let deps = record.dependOn('start_');
        let diff = _.intersection(dynamicIds, deps);
        if(diff.length>0){
          let errorMsg = `Mrgsolve does not support when initial assignments depends on dynamic values: ${diff}\n`
          + `${record.id}$${record.space} []= ${record.assignments.start_.expr}`;
            
          throw new Error(errorMsg);
        }
      });

    // set array of records
    model.records = model.population
      .filter((component) => component.instanceOf('Record'));

    // set sorted array of initials
    model.start_ = model.population
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.start_;
      }).sortExpressionsByContext('start_');

    // set sorted array of rules
    model.ode_ = model.population
      .filter((component) => {
        return component.instanceOf('Record') 
          && component.assignments 
          && component.assignments.ode_;
      }).sortExpressionsByContext('ode_');

    return model;
  }
  getMrgsolveCode(){
    return nunjucks.render(
      'mrgsolve-export/model.cpp.njk',
      this
    );
  }
}

Container.prototype.classes.MrgsolveExport = MrgsolveExport;

module.exports = { MrgsolveExport };
