const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    filepath: {type: 'string', pattern: '^[\\w\\d\\\\/._!-:]+$'},
    spaceFilter: { type: 'string' }
  }
};

/*
  AbstractExport class

  export1 @AbstractExport {
    filepath: ../dir1,
    powTransform: keep // possible values are: keep/operator/function
  };
*/
class AbstractExport {
  constructor(q = {}){

    // check arguments here
    let { logger } = this._builder;
    let valid = AbstractExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.filepath = q.filepath || this.defaultFilepath;
    
    this.spaceFilter = q.spaceFilter || '.+';
  }
  get className(){
    return 'AbstractExport';
  }
  /*
    Method creates exported files.
    return in format 
    [{
      content: <String>, // output text file
      pathSuffix: <String>, // relative path to output file
      type: 'text' // currently support only text
    }]
  */
  makeText() {
    throw new TypeError(`No method makeText() for "${this.className}"`);
  }
  get requireConcrete() {
    return false;
  }
  selectedNamespaces() {
    let { container, logger } = this._builder;
    // filter namespaces if set
    let filteredNS = [...container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName));
    
    // select only concrete namespaces
    let concreteNS = this.requireConcrete 
      ? filteredNS.filter(([spaceName, ns]) => !ns.isAbstract)
      : filteredNS;

    if (concreteNS.length === 0) {
      let msg = `Nothing was exported because there is no concrete namespaces matching spaceFilter in "${this.format}".`;
      logger.warn(msg, {});
    }

    return concreteNS;
  }
  make() {
    let text = this.makeText();
    let buffer = text.map((x) => {
      return {
        content: Buffer.from(x.content, 'utf-8'),
        pathSuffix: x.pathSuffix,
        type: 'buffer'
      };
    });
    
    return buffer;
  }
  static get validate() {
    return ajv.compile(schema);
  }
  static isValid(q, logger) {
    let valid = this.validate(q);
    if (!valid) {
      let msg = `Some of properties do not satisfy requirements for "${this.name}"\n`
        + this.validate.errors.map((x, i) => `    ${i+1}. ${x.instancePath} ${x.message}`)
          .join('\n');
      logger?.error(msg, {type: 'ValidationError'});
    }
    
    return valid;
  }
}

module.exports = { AbstractExport };
