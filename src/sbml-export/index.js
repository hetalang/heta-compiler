const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
const nunjucks = require('../nunjucks-env');
require('./expression');
const legalUnits = require('./legal-units');

class SBMLExport extends _Export {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  make(){
    this.image = this._getSBMLImage(this.space);

    return [{
      content: this.getSBMLCode(),
      pathSuffix: '.xml',
      type: 'text'
    }];
  }
  _getSBMLImage(targetSpace){
    let population = this._container
      .getPopulation(targetSpace, false);

    let listOfUnitDefinitions = population.getUniqueUnits()
      .map((units) => {
        return units
          .toXmlUnitDefinition(legalUnits, { nameStyle: 'string', simplify: true });
      });
      
    return {
      population: population,
      listOfUnitDefinitions: listOfUnitDefinitions
    };
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
