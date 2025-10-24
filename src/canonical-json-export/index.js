const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { ajv } = require('../ajv');
const { create } = require('mathjs');
const { createHash } = require('node:crypto');

const schema = {
  type: 'object',
  properties: {
  }
};

class CanonicalJSONExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = CanonicalJSONExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }
  }
  get className(){
    return 'CanonicalJSONExport';
  }
  get defaultFilepath() {
    return 'canonical';
  }
  get format(){
    return 'CanonicalJSON';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  // object witout meta
  makeObject() {
   // filtered namespaces
    let nsArray = this.selectedNamespaces();

    // create qArr from NS
    let qArr_ns = nsArray
      .map(([spaceName, ns]) => ns.toQ({canon: true}));
    let qArr_components = nsArray
      .map(([spaceName, ns]) => ns.toQArr(true, { useUnitsExpr: true, canon: true }))
      .flat();
    let qArr_unitDef = [...this._builder.container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ({ useUnitsExpr: true }));
    let qArr_functionDef = [...this._builder.container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_scenario = [...this._builder.container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    
    let qArr_full = [].concat(
      _sortElements(qArr_ns),
      _sortElements(qArr_components),
      _sortElements(qArr_functionDef),
      _sortElements(qArr_unitDef),
      _sortElements(qArr_scenario)
    );

    return _sortKeys(qArr_full);
  }
  makeFullObject() {
    // create full object without meta
    let qArr_full = this.makeObject();
 
    // create canonical string
    let canonicalString = JSON.stringify(qArr_full);
    // create hash sum
    const hash = createHash('sha256')
      .update(canonicalString, 'utf8') // canonical JSON
      .digest('hex');

    let qArr_final = [{
      action: 'setMeta',
      builderVersion: pkg.version,
      createdAt: new Date().toISOString(),
      format: this.format,
      canonical: true,
      hashSum: hash,
      hashAlgorithm: 'sha256'
    }].concat(qArr_full);

    return qArr_final;
  }
  makeText(){
    let qArr_final = this.makeFullObject();

    return [{
      content: JSON.stringify(qArr_final, null, 2),
      pathSuffix: '/output.json',
      type: 'text'
    }];
  }
}

// Sort Elements by action/space/id
function _sortElements(array) {
  return array.sort((x, y) => {
    let keyA = x.action + '::' + (x.space || '') + '::' + (x.id || '');
    let keyB = y.action + '::' + (y.space || '') + '::' + (y.id || '');
    return keyA.localeCompare(keyB);
  });
}

// only for sorting object keys
function _sortKeys(o) {
  if (Array.isArray(o)) return o.map(_sortKeys);
  if (o && typeof o === 'object') {
    const out = {};
    for (const k of Object.keys(o).sort()) out[k] = _sortKeys(o[k]);
    return out;
  }
  return o;
}

module.exports = CanonicalJSONExport;
