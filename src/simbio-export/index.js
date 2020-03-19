const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('../nunjucks-env');
const fs = require('fs');
const path = require('path');
const legalUnits = require('./legal-units');

const fun = fs.readFileSync(
  path.join(__dirname, 'fun.m'),
  'utf8'
);

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
        content: fun,
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
  toQ(){
    let res = super.toQ();

    return res;
  }
}

SimbioExport._requirements = { };

Container.prototype.classes.SimbioExport = SimbioExport;

module.exports = {
  SimbioExport
};
