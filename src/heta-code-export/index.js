/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
  }
};

class HetaCodeExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = HetaCodeExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'HetaExport';
  }
  get format(){
    return 'heta';
  }
  get defaultFilepath() {
    return 'heta-code';
  }
  /**
   * Creates Heta code text outputs.
   *
   * @returns {object[]} Text outputs with `content`, `pathSuffix`, and `type`.
   */
  makeText() {
    // let { logger } = this._builder;

    let image = this.getHetaCodeImage(this._builder.container);
    let content = this.getHetaCodeCode(image);

    return [{
      content: content,
      pathSuffix: '/output.heta',
      type: 'text'
    }];
  }
  /**
   * Creates the model image used by the Heta code template.
   *
   * @returns {object} Template image.
   */
  getHetaCodeImage() {
    let { namespaceStorage, functionDefStorage, unitDefStorage, logger } = this._builder.container;

    let filteredNamespaceStorage = [...namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName));
    
    return {
      functionDefStorage: [...functionDefStorage],
      unitDefStorage: [...unitDefStorage],
      namespaceStorage: filteredNamespaceStorage
    };
  }
  getHetaCodeCode(image = {}){
    return compiledTemplates['heta-code.heta.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = HetaCodeExport;
