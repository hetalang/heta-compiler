/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
require('./expression'); // to use method toMatlabString()
require('./namespace');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class MatlabExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = MatlabExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'MatlabExport';
  }
  get defaultFilepath() {
    return 'matlab';
  }
  get format(){
    return 'Matlab';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  // TODO: skipVersionCode does not work
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  makeText(skipVersionCode = false){
    let { logger } = this._builder.container;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();

    let results = [];

    selectedNamespaces.forEach(([spaceName, ns]) => {
      let image = ns.getMatlabImage();

      let modelContent = this.getModelCode(image);
      let paramContent = this.getParamCode(image);
      let runContent = this.getRunCode(image);
      
      results.push({
        content: modelContent,
        pathSuffix: `/${spaceName}_model.m`,
        type: 'text'
      });

      results.push({
        content: paramContent,
        pathSuffix: `/${spaceName}_param.m`,
        type: 'text'
      });

      results.push({
        content: runContent,
        pathSuffix: `/${spaceName}_run.m`,
        type: 'text'
      });
    });

    return results;
  }
  getModelCode(image = {}){
    return compiledTemplates['matlab-model.m.njk'].render(image);
  }
  getParamCode(image = {}){
    return compiledTemplates['matlab-param.m.njk'].render(image);
  }
  getRunCode(image = {}){
    return compiledTemplates['matlab-run.m.njk'].render(image);
  }
}

module.exports = MatlabExport;
