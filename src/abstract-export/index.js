const { ajv } = require('../ajv');

const schema = {
  type: 'object',
  properties: {
    filepath: {type: 'string', pattern: '^[\\w\\d\\\\/._!-:]+$'},
    spaceFilter: { type: 'string' }
  }
};

/**
 * Base class for all export formats.
 *
 * Concrete exporters implement {@link AbstractExport#makeText}; `make` wraps
 * text outputs into UTF-8 buffers for file writing.
 *
 * @class AbstractExport
 *
 * @param {object} q Export declaration object.
 *
 * @property {string} filepath Base output filepath.
 * @property {string} spaceFilter Regular expression used to select namespaces.
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
  /**
   * Creates text export outputs.
   *
   * @returns {object[]} Text outputs with `content`, `pathSuffix`, and `type`.
   */
  makeText() {
    throw new TypeError(`No method makeText() for "${this.className}"`);
  }
  /**
   * Whether the exporter requires concrete namespaces only.
   *
   * @returns {boolean} `true` if abstract namespaces must be excluded.
   */
  get requireConcrete() {
    return false;
  }
  /**
   * Selects namespaces matching `spaceFilter`.
   *
   * @returns {Array[]} Pairs of `[spaceName, namespace]`.
   */
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
  /**
   * Creates buffer export outputs ready for file writing.
   *
   * @returns {object[]} Buffer outputs with `content`, `pathSuffix`, and `type`.
   */
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
  /**
   * Validates an export declaration.
   *
   * @param {object} q Export declaration object.
   * @param {Logger} logger Logger used for validation errors.
   *
   * @returns {boolean} `true` when valid.
   */
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
