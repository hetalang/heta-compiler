/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../ajv');
require('./namespace');

const schema = {
  type: 'object',
  properties: {}
};

class MrgsolveExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = MrgsolveExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'MrgsolveExport';
  }
  get defaultFilepath() {
    return 'mrgsolve';
  }
  get format(){
    return 'mrgsolve';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  get requireConcrete() {
    return true;
  }
  makeText() {
    //let { logger } = this._builder;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let mrgsolveImage = ns.getMrgsolveImage();
      let codeContent = this.getMrgsolveCode(mrgsolveImage);

      return {
        content: codeContent,
        pathSuffix: `/${spaceName}.cpp`,
        type: 'text'
      };
    });

    let runContent = this.getMrgsolveRun(selectedNamespaces);
    results.push({
      content: runContent,
      pathSuffix: '/run.r',
      type: 'text'
    });

    return results;
  }
  getMrgsolveCode(DynMSModel = {}){
    return compiledTemplates['mrgsolve-model.cpp.njk'].render(DynMSModel);
  }
  getMrgsolveRun(selectedNamespaces){
    return compiledTemplates['mrgsolve-run.r.njk'].render({selectedNamespaces});
  }
}

module.exports = MrgsolveExport;
