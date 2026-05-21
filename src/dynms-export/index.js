const DYNMS_SCHEMA = 'https://raw.githubusercontent.com/hetalang/dynms/refs/heads/main/schema.json';
const DYNMS_VERSION = '0.1.0';

const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');
const { omitByPaths } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    exprFormat: {type: 'string', enum: ['heta', 'c', 'julia'], default: 'heta'},
  }
};

class DynMS extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DynMS.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.exprFormat = q.exprFormat || 'heta';
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
    // meta information
    let DynMSObj = {
      '$schema': DYNMS_SCHEMA,
      dynms: DYNMS_VERSION,
      generator: {name: pkg.name, version: pkg.version},
      created: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      platformNotes: this._builder.notes,
      license: this._builder.license,
      models: [],
      // scenarios: []
    };

    DynMSObj.models = this.selectedNamespaces()
      .filter(([spaceName, ns]) => !ns.isAbstract)
      .map(([spaceName, ns]) => {
        return ns.makeDynMSModel(this.exprFormat);
      });

    return [{
      content: JSON.stringify(DynMSObj, null, 2),
      pathSuffix: '/output.dynms.json',
      type: 'text'
    }];
  }
}

module.exports = DynMS;
