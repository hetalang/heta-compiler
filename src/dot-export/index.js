/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../ajv');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class DotExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DotExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'DotExport';
  }
  get format(){
    return 'Dot';
  }
  get defaultFilepath() {
    return 'dot';
  }
  makeText(){
    let { logger } = this._builder;

    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let image = ns.getDotImage();
      let content = this.getDotCode(image);

      return {
        content: content,
        pathSuffix: `/${spaceName}.dot`,
        type: 'text'
      };
    });

    return results;
  }
  getDotCode(image = {}){
    return compiledTemplates['dot.dot.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = DotExport;
