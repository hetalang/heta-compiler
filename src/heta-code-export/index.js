const { AbstractExport } = require('../core/abstract-export');
const nunjucks = require('nunjucks');
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
  /**
   * The method creates text code to save as Heta code file.
   *
   * @return {string} Text code of exported format.
   */
  make(){
    // let logger = this._container.logger;

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
    
    return container;
  }
  getHetaCodeCode(image = {}){
    return nunjucks.render('heta-code.heta.njk', image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = HetaCodeExport;
