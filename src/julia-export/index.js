/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../utils');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class JuliaExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = JuliaExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'JuliaExport';
  }
  get format(){
    return 'Julia';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  get defaultFilepath() {
    return 'julia';
  }
  // skipVersionCode means that the version will not be printed in output
  // this is required for autotests
  makeText(skipVersionCode = false) {
    //let { logger } = this._builder;
    // create image for multiple namespaces
    let nsImages = this.selectedNamespaces()
      .map(([spaceName, ns]) => ns.getJuliaImage());

    // create Content
    let image = {
      builderVersion: skipVersionCode ? '*' : pkg.version,
      options: this,
      nsImages,
      functionDefArray: [...this._builder.container.functionDefStorage.values()].filter((fd) => !fd.isCore)
    };
    let modelContent = this.getModelCode(image);
    let runContent = this.getRunCode(image);

    return [
      {
        content: modelContent,
        pathSuffix: '/model.jl',
        type: 'text'
      },
      {
        content: runContent,
        pathSuffix: '/run.jl',
        type: 'text'
      }
    ];
  }
  getModelCode(image = []){
    return compiledTemplates['julia-model.jl.njk'].render(image);
  }
  getRunCode(image = []){
    return compiledTemplates['julia-run.jl.njk'].render(image);
  }
}

module.exports = JuliaExport;

