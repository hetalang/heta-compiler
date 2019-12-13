const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
const fs = require('fs');
const path = require('path');

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
    this._model_ = this._getSimbioImage(this.space);

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
  _getSimbioImage(targetSpace){
    let model = {
      model: this.id,
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

    return res;
  }
}

SimbioExport._requirements = { };

Container.prototype.classes.SimbioExport = SimbioExport;

module.exports = {
  SimbioExport
};
