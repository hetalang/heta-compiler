const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
const legalUnits = require('./legal-units');

class SimbioExport extends _Export{
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'SimbioExport';
  }
  make(){
    let image = this._getSimbioImage();

    return [
      {
        content: this.getSimbioCode(image),
        pathSuffix: '/model.m',
        type: 'text'
      },
      {
        content: this.getFunCode(),
        pathSuffix: '/fun.m',
        type: 'text'
      }
    ];
  }
  _getSimbioImage(){
    return {
      population: this.namespace,
      legalUnits: legalUnits
    };
  }
  getSimbioCode(image = {}){
    return nunjucks.render(
      'template.m.njk',
      image
    );
  }
  getFunCode(){
    return nunjucks.render(
      'fun.m',
      this
    );
  }
  toQ(options = {}){
    let res = super.toQ(options);

    return res;
  }
}

SimbioExport._requirements = { };

Container.prototype.exports.Simbio = SimbioExport;

module.exports = {
  SimbioExport
};
