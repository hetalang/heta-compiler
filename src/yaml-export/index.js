const { AbstractExport } = require('../core/abstract-export');
const { safeDump } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _omit = require('lodash/omit');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    omit: {type: 'array', items: { type: 'string' }},
    noUnitsExpr: {type: 'boolean'}
  }
};

class YAMLExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._container.logger;
    let valid = YAMLExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.omit) this.omit = q.omit;
    if (q.noUnitsExpr) this.noUnitsExpr = q.noUnitsExpr;
  }
  get className(){
    return 'YAMLExport';
  }
  get format(){
    return 'YAML';
  }
  makeText(){
    // filtered namespaces
    let nsArrayFiltered = [...this._container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName))
      .map(([spaceName, ns]) => ns);

    // create qArr from NS
    let qArr_ns = nsArrayFiltered.reduce((accumulator, ns) => {
      let qArr_setns = ns.spaceName === 'nameless' ? [] : [ns.toQ()]; // skip default NS
      let qArr_components = ns.toQArr(true, { noUnitsExpr: this.noUnitsExpr });
      return accumulator.concat(qArr_setns, qArr_components);
    }, []);
    let qArr_unitDef = [...this._container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_functionDef = [...this._container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_scenario = [...this._container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
      
    let qArr_full = [].concat(qArr_ns, qArr_unitDef, qArr_functionDef, qArr_scenario);

    // remove unnecessary properties
    let qArr = this.omit ? qArr_full.map((q) => _omit(q, this.omit)) : qArr_full;

    let order = ['class', 'id', 'space', 'title', 'notes', 'tags', 'aux'];
    let compareFunction = fromOrderToCompare(order);
    let yaml = safeDump(qArr, {
      skipInvalid: true, // TOFIX: ???
      flowLevel: 3,
      sortKeys: compareFunction,
      styles: {}
    });
    
    return [{
      content: yaml,
      pathSuffix: '.yml',
      type: 'text'
    }];
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

function fromOrderToCompare(order=[]){
  return (x, y) => {
    let indX = order.indexOf(x);
    let indY = order.indexOf(y);
    return (indX===-1 || indY===-1)
      ? indY - indX
      : indX - indY;
  };
}

module.exports = YAMLExport;
