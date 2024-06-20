/* global compiledTemplates */
const { AbstractExport } = require('../abstract-export');
require('./expression');
require('./namespace');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    groupConstBy: {type: 'string', pattern: '^[\\w\\d.\\[\\]]+$'},
    powTransform: {type: 'string', enum: ['keep', 'operator', 'function'] },
    version: {enum: ['25', '26', 25, 26]},
  }
};

class DBSolveExport extends AbstractExport{
  constructor(q = {}, isCore = false) {
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = DBSolveExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.powTransform = q.powTransform ? q.powTransform : 'keep';
    if (q.groupConstBy) {
      this.groupConstBy = q.groupConstBy;
    } else {
      this.groupConstBy = 'tags[0]';
    }

    this.version = q.version ? q.version + '' : '26'; // force string
    
    if (q.defaultTask) this.defaultTask = q.defaultTask;
  }
  get requireConcrete() {
    return true;
  }
  get defaultFilepath() {
    return 'dbsolve';
  }
  /**
   * The method creates text code to save as SLV file.
   *
   * @return {string} Text code of exported format.
   */
  makeText() {
    let logger = this._container.logger;


    let selectedNamespaces = this.selectedNamespaces();

    let results = selectedNamespaces.map(([spaceName, ns]) => {
      let image = ns.getDBSolveImage(this.powTransform, this.groupConstBy, this.version);
      let content = this.getSLVCode(image);

      return {
        content: content,
        pathSuffix: `/${spaceName}.slv`,
        type: 'text'
      };
    });

    return results;
  }
  getSLVCode(image = {}) {
    return compiledTemplates['dbsolve-model.slv.njk'].render(image);
  }
  get className() {
    return 'DBSolveExport';
  }
  get format() {
    return 'DBSolve';
  }
  static get validate() {
    return ajv.compile(schema);
  }
}

module.exports = DBSolveExport;
