/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
require('./namespace');

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
    let logger = this._builder.logger;
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
  get defaultFilepath() {
    return 'sbml';
  }
  get format(){
    return 'SBML';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  makeText(){
    let logger = this._builder.logger;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();
    
    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let image = ns.getSBMLImage();
      var content = this.getSBMLCode(image);
      
      return {
        content: content,
        pathSuffix: `/${spaceName}.xml`,
        type: 'text'
      };
    });

    return results;
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
      this._builder.logger.error(`SBML of version "${this.version}" is not supported.`);
      return '';
    }
    
  }
}

module.exports = SBMLExport;
