const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
require('./expression');
const legalUnits = require('../legal-sbml-units');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    version: {type: 'string', pattern: '^L[123]V[12345]$'},
  }
};

class SBMLExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = SBMLExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (typeof q.version !== 'undefined') {
      this.version = q.version;
    } else {
      this.version = 'L2V4';
    } 

    if (q.spaceFilter instanceof Array) {
      this.spaceFilter = q.spaceFilter;
    } else if (typeof q.spaceFilter === 'string') {
      this.spaceFilter = [q.spaceFilter];
    }
  }
  get className(){
    return 'SBMLExport';
  }
  get format(){
    return 'SBML';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  make(){
    let logger = this._container.logger;

    if (this.spaceFilter !== undefined) {
      // empty namespace is not allowed
      if (this.spaceFilter.length === 0) {
        let msg = 'spaceFilter for SBML format should include at least one namespace, got empty';
        logger.error(msg);
        return []; // BRAKE
      }
      
      // check if namespaces exists
      let lostNamespaces = this.spaceFilter.filter((x) => !this._container.namespaceStorage.has(x));
      if (lostNamespaces.length > 0) {
        let msg = `Namespaces: ${lostNamespaces.join(', ')} do not exist. SBML export stopped.`;
        logger.error(msg);
        return []; // BRAKE
      }
    }

    // filter namespaces if set
    let selectedNamespaces = this.spaceFilter !== undefined 
      ? [...this._container.namespaceStorage].filter((x) => this.spaceFilter.indexOf(x[0]) !== -1)
      : [...this._container.namespaceStorage];
    
    let results = selectedNamespaces.map((x) => {
      let spaceName = x[0];
      let ns = x[1];
      let image = this.getSBMLImage(ns);
      var content = this.getSBMLCode(image);

      if (ns.isAbstract) {
        let msg = `UnitDefinitions in SBML will be skipped for the abstract namespace "${spaceName}".`;
        logger.info(msg);
      }
      
      return {
        content: content,
        pathSuffix: `/${spaceName}.xml`,
        type: 'text'
      };
    });


    return results;
  }
  getSBMLImage(ns){
    let logger = ns.container.logger;

    // set unitDefinitions for concrete namespace
    if (ns.isAbstract) {
      var listOfUnitDefinitions = []; 
    } else {
      try {
        listOfUnitDefinitions = ns.getUniqueUnits()
          .map((units) => {
            return units
              .toXmlUnitDefinition(legalUnits, { nameStyle: 'string', simplify: true });
          });
      } catch(err){
        logger.warn(err.message);
        listOfUnitDefinitions = [];
      }
    }

    // set functionDefinition
    let listOfFunctionDefinitions = [...ns.container.functionDefStorage.values()];
    
    return {
      population: ns,
      listOfUnitDefinitions,
      listOfFunctionDefinitions
    };
  }
  getSBMLCode(image = {}){
    switch (this.version) {
    case 'L2V3':
      return nunjucks.render('sbmlL2V3.xml.njk', image);
      break;
    case 'L2V4':
      return nunjucks.render('sbmlL2V4.xml.njk', image);
      break;
    case 'L2V5':
      return nunjucks.render('sbmlL2V5.xml.njk', image);
      break;
    case 'L3V1':
      return nunjucks.render('sbmlL3V1.xml.njk', image);
      break;
    case 'L3V2':
      return nunjucks.render('sbmlL3V2.xml.njk', image);
      break;
    default:
      this._container.logger.error(`SBML of version "${this.version}" is not supported.`);
      return '';
    }
    
  }
}

module.exports = SBMLExport;
