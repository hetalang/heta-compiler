const { AbstractExport } = require('../core/abstract-export');
/* global compiledTemplates */
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
  makeText(){
    let logger = this._container.logger;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();
    
    let results = selectedNamespaces.map(([spaceName, ns]) => {
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
      return compiledTemplates['sbmlL2V3.xml.njk'](image);
      break;
    case 'L2V4':
      return compiledTemplates['sbmlL2V4.xml.njk'].render(image);
      break;
    case 'L2V5':
      return compiledTemplates['sbmlL2V5.xml.njk'].render(image);
      break;
    case 'L3V1':
      return compiledTemplates['sbmlL3V1.xml.njk'].render(image);
      break;
    case 'L3V2':
      return compiledTemplates['sbmlL3V2.xml.njk'].render(image);
      break;
    default:
      this._container.logger.error(`SBML of version "${this.version}" is not supported.`);
      return '';
    }
    
  }
}

module.exports = SBMLExport;
