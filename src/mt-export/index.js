/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');
const { re } = require('mathjs');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class MTExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = MTExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'MTExport';
  }
  get format(){
    return 'MT';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  get defaultFilepath() {
    return 'mt';
  }
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  makeText(skipVersionCode = false) {
    //let logger = this._container.logger;

    let results = this.selectedNamespaces().map(([spaceName, ns]) => {
      let image = ns.getMTImage();
      let content = this.getModelCode(image);

      return {
        content: content,
        pathSuffix: `/${spaceName}.jl`,
        type: 'text'
      };
    });

    return results;
  }
  getModelCode(image = []){
    return compiledTemplates['mt-model.jl.njk'].render(image);
  }
}

module.exports = MTExport;
