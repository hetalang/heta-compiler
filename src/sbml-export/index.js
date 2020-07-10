const Container = require('../container');
const { _Export } = require('../core/_export');
const nunjucks = require('nunjucks');
require('./expression');
const legalUnits = require('./legal-units');

class SBMLExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'SBMLExport';
  }
  make(){
    this.image = this._getSBMLImage();

    return [{
      content: this.getSBMLCode(),
      pathSuffix: '.xml',
      type: 'text'
    }];
  }
  _getSBMLImage(){
    let logger = this.namespace.container.logger;
    if (this.namespace.isAbstract) {
      var listOfUnitDefinitions = []; 
    } else {
      try {
        listOfUnitDefinitions = this.namespace.getUniqueUnits()
          .map((units) => {
            return units
              .toXmlUnitDefinition(legalUnits, { nameStyle: 'string', simplify: true });
          });
      } catch(err){
        logger.warn(err.message);
        listOfUnitDefinitions = [];
      }
    }
    
    return {
      population: this.namespace,
      listOfUnitDefinitions: listOfUnitDefinitions
    };
  }
  getSBMLCode(){
    return nunjucks.render(
      'sbmlL2V4.xml.njk',
      this
    );
  }
  toQ(options = {}){
    let res = super.toQ(options);

    return res;
  }
}

SBMLExport._requirements = { };

Container.prototype.exports.SBML = SBMLExport;

module.exports = {
  SBMLExport
};
