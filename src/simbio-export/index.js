const Container = require('../container');
const { _Export } = require('../core/_export');
//const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
//const _ = require('lodash');

class SimbioExport extends _Export{
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);
    if(q.model)
      this.model = q.model;
    if(q.skipMathChecking)
      this.skipMathChecking = q.skipMathChecking;

    return this;
  }
  get className(){
    return 'SimbioExport';
  }
  get ext(){
    return 'm';
  }
  do(){
    this._model_ = this._getSimbioImage(this.model);
    return this.getSimbioCode();
  }
  _getSimbioImage(targetSpace){
    let model = {
      model: this.model,
      population: this._container.getPopulation(targetSpace, this.skipMathChecking)
    };
    return model;
  }
  getSimbioCode(){
    return nunjucks.render(
      'simbio-export/template.m.njk',
      this
    );
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    if(this.skipMathChecking) res.skipMathChecking = this.skipMathChecking;

    return res;
  }
  static _requirements(){
    return {
      model: {
        required: true
      }
    };
  }
}

Container.prototype.classes.SimbioExport = SimbioExport;

module.exports = { SimbioExport };
