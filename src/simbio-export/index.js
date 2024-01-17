/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class SimbioExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = SimbioExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'SimbioExport';
  }
  get defaultFilepath() {
    return 'simbio';
  }
  get format(){
    return 'Simbio';
  }
  get requireConcrete() {
    return true;
  }
  // return text for all namespaces
  makeText(){
    let logger = this._container.logger;

    // display that function definition is not supported
    let userDefinedFunctions = [...this._container.functionDefStorage]
      .filter(([id, functionDef]) => !functionDef.isCore)
      .map(([id, functionDef]) => id);
    if (userDefinedFunctions.length > 0) {
      logger.warn(`User defined functions: ${userDefinedFunctions.join(', ')} are presented in platform but not supported by Simbio export.`);
    }

    let results = this.selectedNamespaces().map(([spaceName, ns]) => {

      let image = ns.getSimbioImage();
      let modelCode = compiledTemplates['simbio.m.njk'].render(image);

      return {
        content: modelCode,
        pathSuffix: `/${spaceName}.m`,
        type: 'text'
      };
    });

    // add function definitions code
    let functionsCode = compiledTemplates['simbio-tern__.m.njk'].render(this);

    results.push({
      content: functionsCode,
      pathSuffix: '/tern__.m',
      type: 'text'
    });

    return results;
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SimbioExport;
