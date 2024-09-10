/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
require('./namespace');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    eventsOff: {type: 'boolean'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
    version: {enum: ['25', '26', 25, 26]},
  }
};

class SLVExport extends AbstractExport{
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = SLVExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.powTransform = q.powTransform ? q.powTransform : 'keep';
    if (q.groupConstBy) {
      this.groupConstBy = q.groupConstBy;
    } else {
      this.groupConstBy = 'tags[0]';
    }
    if (q.eventsOff) this.eventsOff = q.eventsOff;
    if (q.defaultTask) this.defaultTask = q.defaultTask;
    this.version = q.version ? q.version + '' : '26'; // force string
  }
  get className(){
    return 'SLVExport';
  }
  get defaultFilepath() {
    return 'slv';
  }
  get format(){
    return 'SLV';
  }
  get requireConcrete() {
    return true;
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  makeText() {
    //let { logger } = this._builder;

    // filter namespaces if set
    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let image = ns.getSLVImage(this.groupConstBy, this.powTransform, this.version);
      let content = this.getSLVCode(image);
        
      return {
        content: content,
        pathSuffix: `/${spaceName}.slv`,
        type: 'text'
      };
    });

    return results;
  }
  getSLVCode(image = {}){
    return compiledTemplates['slv-blocks-template.slv.njk'].render(image);
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = SLVExport;
