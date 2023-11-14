const { AbstractExport } = require('../abstract-export');
/* global compiledTemplates */
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
  }
};

class HetaCodeExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
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
   * The method creates text code to save as Heta code file.
   *
   * @return {string} Text code of exported format.
   */
  makeText(){
    // let logger = this._container.logger;

    // XXX: do not filter namespaces
    let image = this.getHetaCodeImage(this._container);
    let content = this.getHetaCodeCode(image);

    return [{
      content: content,
      pathSuffix: '.heta',
      type: 'text'
    }];
  }
  /**
   * Creates model image by necessary components based on container.
   * @param {string} container - Model image to update.
   *
   * @return {undefined}
   */
  getHetaCodeImage(container){
    // let logger = this._container.logger;

    let filteredNamespaceStorage = [...container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName));
    
    return {
      functionDefStorage: [...container.functionDefStorage],
      unitDefStorage: [...container.unitDefStorage],
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
