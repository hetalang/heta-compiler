const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {}
};

class CanonicalExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = CanonicalExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'CanonicalExport';
  }
  get defaultFilepath() {
    return 'canonical';
  }
  get format(){
    return 'canonical';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  makeText(){
    let { container } = this._builder;
    let qArr_final = container.makeCanonicalFull();

    return [{
      content: JSON.stringify(qArr_final, null, 2),
      pathSuffix: '/output.heta.json',
      type: 'text'
    }];
  }
}

module.exports = CanonicalExport;
