/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
  }
};

class SummaryExport extends AbstractExport {
  constructor(q = {}, isCore = false) {
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = SummaryExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'SummaryExport';
  }
  get format(){
    return 'Summary';
  }
  get defaultFilepath() {
    return 'summary';
  }
  makeText() {
    let logger = this._container.logger;
    let selectedNamespaces = this.selectedNamespaces();

    let image = {
      unitDefStorage: this._container.unitDefStorage,
      functionDefStorage: this._container.functionDefStorage,
      namespaceStorage: this._container.namespaceStorage,
      nsImages: selectedNamespaces.map((x) => x[1].getSummaryImage())
    };
    let content = this.getDotCode(image);

    return [{
      content: content,
      pathSuffix: '/platform.md',
      type: 'text'
    }];
  }
  getDotCode(image = {}) {
    return compiledTemplates['summary.md.njk'].render(image);
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

module.exports = SummaryExport;
