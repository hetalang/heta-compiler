const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('../nunjucks-env');
const legalUnits = require('./legal-units');

class SimbioExport extends _Export{
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'SimbioExport';
  }
  make(){
    this.logger.reset();
    this.image = this._getSimbioImage();

    return [
      {
        content: this.getSimbioCode(),
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
  getSimbioCode(){
    return nunjucks.render(
      'simbio-export/template.m.njk',
      this
    );
  }
  getFunCode(){
    return nunjucks.render(
      'simbio-export/fun.m',
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
