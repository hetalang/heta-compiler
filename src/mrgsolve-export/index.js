/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class MrgsolveExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._builder.logger;
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
    return 'Mrgsolve';
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
      let image = ns.getMrgsolveImage();
      var codeContent = this.getMrgsolveCode(image);

      return {
        content: codeContent,
        pathSuffix: `/${spaceName}.cpp`,
        type: 'text'
      };
    });

    var runContent = this.getMrgsolveRun(selectedNamespaces);
    results.push({
      content: runContent,
      pathSuffix: '/run.r',
      type: 'text'
    });

    return results;
  }
  getMrgsolveCode(image = {}){
    return compiledTemplates['mrgsolve-model.cpp.njk'].render(image);
  }
  getMrgsolveRun(selectedNamespaces){
    return compiledTemplates['mrgsolve-run.r.njk'].render({selectedNamespaces});
  }
}

module.exports = MrgsolveExport;
