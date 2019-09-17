const Container = require('../container');
const { _Export } = require('../core/_export');
//const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
//const _ = require('lodash');

class SBMLExport extends _Export{
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);
    if(q.model===undefined){
      throw new TypeError(`"model" property in SBMLExport ${this.id} should be declared.`);
    }
    this.model = q.model;
    if(q.skipMathChecking)
      this.skipMathChecking = q.skipMathChecking;

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  get ext(){
    return 'xml';
  }
  do(){
    this._model_ = this._getSBMLImage(this.model);
    return this.getSBMLCode();
  }
  _getSBMLImage(targetSpace){
    let model = {
      population: this._container.getPopulation(targetSpace, this.skipMathChecking)
    };
    return model;
  }
  getSBMLCode(){
    return nunjucks.render(
      'sbml-export/template.xml.njk',
      this
    );
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    if(this.skipMathChecking) res.skipMathChecking = this.skipMathChecking;

    return res;
  }
}

Container.prototype.classes.SBMLExport = SBMLExport;

module.exports = { SBMLExport };
