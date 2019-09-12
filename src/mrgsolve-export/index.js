const Container = require('../container');
const { _Export } = require('../core/_export');
//const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
const XArray = require('../x-array');

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

    // set sorted array of rules
    model.ode_ = model.population
      .filter((component) => {
        return component.isRecord 
          && component.assignments 
          && component.assignments.ode_;
      }).sortExpressionsByScope('ode_');

    // set sorted array of initials
    model.start_ = model.population
      .filter((component) => {
        return component.isRecord 
          && component.assignments 
          && component.assignments.start_;
      }).sortExpressionsByScope('start_');

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
