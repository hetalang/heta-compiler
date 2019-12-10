const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
require('./expression');

class SBMLExport extends _Export {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  make(){
    this._model_ = this._getSBMLImage(this.space);

    return [{
      content: this.getSBMLCode(),
      pathSuffix: '.xml',
      type: 'text'
    }];
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

    return res;
  }
}

SBMLExport._requirements = { };

Container.prototype.classes.SBMLExport = SBMLExport;

module.exports = {
  SBMLExport
};
