const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
const fs = require('fs');
const path = require('path');
const legalUnits = require('./legal-units');
const _ = require('lodash');

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
    this.image = this._getSimbioImage(this.space);

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
    let population = this._container
      .getPopulation(targetSpace, false);
    
    // create unit transformator based on unitDef and legalUnits
    let unitTransformator = _.chain(population)
      .filter((x) => x.className === 'UnitDef')
      .map((x) => [x.id, x.unitsParsed])
      .fromPairs()
      .omit(legalUnits) // skip allowed units from transformator
      .value();
      
    return {
      id: this.id, // not sure this is required
      population: population,
      unitTransformator: unitTransformator
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
