const DYNMS_SCHEMA = 'https://raw.githubusercontent.com/hetalang/dynms/refs/heads/main/schema.json';
const DYNMS_VERSION = '0.1.0';

const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');
const { omitByPaths } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    omit: {type: 'array', items: { type: 'string' }},
    useUnitsExpr: {type: 'boolean'}
  }
};

class DynMS extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DynMS.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.omit) this.omit = q.omit;
    if (q.useUnitsExpr) this.useUnitsExpr = q.useUnitsExpr;
  }
  get className(){
    return 'DynMS';
  }
  get defaultFilepath() {
    return 'dynms';
  }
  get format(){
    return 'dynms';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  
  makeText(){
    let DynMSObj = {
      '$schema': DYNMS_SCHEMA,
      dynms: DYNMS_VERSION,
      toolName: pkg.name,
      toolVersion: pkg.version,
      created: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      platformNotes: this._builder.notes,
      license: this._builder.license,
      models: [],
      scenarios: []
    };

    DynMSObj.models = this.selectedNamespaces().map(([spaceName, ns]) => {
      let model = ns.getDynMSModel();
        
      return model;
    });

    return [{
      content: JSON.stringify(DynMSObj, null, 2),
      pathSuffix: '/output.dynms.json',
      type: 'text'
    }];
  }
}

module.exports = DynMS;
