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
    } else {
      this.spaceFilter = ['nameless'];
    }
  }
  get className(){
    return 'SBMLExport';
  }
  get format(){
    return 'SBML'
  }
  static get validate(){
    return ajv.compile(schema);
  }
  make(){
    // use only one namespace
    let logger = this._container.logger;
    if (this.spaceFilter.length === 0) {
      let msg = 'spaceFilter for SBML format should include at least one namespace but get empty';
      logger.err(msg);
      var content = '';
    } else if (!this._container.namespaceStorage.has(this.spaceFilter[0])) {
      let msg = `Namespace "${this.spaceFilter[0]}" does not exist.`;
      logger.err(msg);
      content = '';
    } else {
      if (this.spaceFilter.length > 1) {
        let msg = `SBML format does not support multispace export. Only first namespace "${this.spaceFilter[0]}" will be used.`;
        logger.warn(msg);
      }
      let ns = this._container.namespaceStorage.get(this.spaceFilter[0]);
      let image = this.getSBMLImage(ns);
      content = this.getSBMLCode(image);
    }

    return [{
      content: content,
      pathSuffix: '.xml',
      type: 'text'
    }];
  }
  getSBMLImage(ns){
    let logger = ns.container.logger;
    // check unsupported properties in @TimeSwitcher, delete later
    /*
    ns
      .selectByInstanceOf('TimeSwitcher')
      .forEach((ts) => {
        // check "period"
        if (typeof ts.periodObj !== 'undefined') {
          let msg = `"SBML" format does not support "period" property in @TimeSwitcher as stated in "${ts.index}".`;
          logger.warn(msg);
        }
        // check "stop"
        if (typeof ts.stopObj !== 'undefined') {
          let msg = `"SBML" format does not support "stop" property in @TimeSwitcher as stated in "${ts.index}".`;
          logger.warn(msg);
        }
      });
    */
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
    
    return {
      population: ns,
      listOfUnitDefinitions: listOfUnitDefinitions
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
      default:
        this._container.logger.error(`SBML of version "${this.version}" is not supported.`);
        return '';
    }
    
  }
}

module.exports = SBMLExport;
