const DYNMS_SCHEMA = 'https://raw.githubusercontent.com/hetalang/heta-compiler/v0.13.0/src/dynms/dynms.schema.json';
const DYNMS_VERSION = '0.3.0';

const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');

const schema = {
  type: 'object'
};

class DynMS extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = DynMS.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
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
  get requireConcrete() {
    return true;
  }
  makeText(){
    //let { logger } = this._builder;

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
      .map(([spaceName, ns]) => {
        return ns.makeDynMSModel();
      });

    return [{
      content: JSON.stringify(DynMSObj, null, 2),
      pathSuffix: '/output.dynms.json',
      type: 'text'
    }];
  }
}

module.exports = DynMS;
