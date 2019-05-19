const Container = require('../container');
const { _Export } = require('../core/_export');
const { IndexedHetaError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
require('./model');

class SBMLExport extends _Export{
  merge(q, skipChecking){
    super.merge(q, skipChecking);
    if(q && typeof q.model===undefined)
      throw new TypeError(`"model" property in SBMLExport ${this.id} should be string.`);
    this.model = q.model;

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  get ext(){
    return 'xml';
  }
  do(){
    this._model_ = this._storage.get(this.model); // TODO: implement get to use this.get({id: model})
    if(this._model_===undefined)
      throw new IndexedHetaError(this.indexObj, `Required property model reffers to lost model id "${this.model}".`);

    return this.getSBMLCode();
  }
  getSBMLCode(){
    this._model_.populate();
    return nunjucks.render(
      'sbml-export/template.xml.njk',
      this
    );
  }
  toQ(){
    let res = super.toQ();
    if(this.model) res.model = this.model;
    return res;
  }
}

Container.prototype.classes.SBMLExport = SBMLExport;

module.exports = { SBMLExport };
