const { AbstractExport } = require('../abstract-export');
const { ajv } = require('../utils');
const _omit = require('lodash/omit');

const schema = {
  type: 'object',
  properties: {
    omit: {type: 'array', items: { type: 'string' }},
    noUnitsExpr: {type: 'boolean'}
  }
};

class JSONExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let logger = this._builder.logger;
    let valid = JSONExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.omit) this.omit = q.omit;
    if (q.noUnitsExpr) this.noUnitsExpr = q.noUnitsExpr;
  }
  get className(){
    return 'JSONExport';
  }
  get defaultFilepath() {
    return 'json';
  }
  get format(){
    return 'JSON';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  makeText(){
    // filtered namespaces
    let nsArrayFiltered = this.selectedNamespaces();

    // create qArr from NS
    let qArr_ns = nsArrayFiltered.reduce((accumulator, [spaceName, ns]) => {
      let qArr_setns = ns.spaceName === 'nameless' && !ns.isAbstract ? [] : [ns.toQ()]; // skip #setNS {space: nameless};
      let qArr_components = ns.toQArr(true, { noUnitsExpr: this.noUnitsExpr });
      return accumulator.concat(qArr_setns, qArr_components);
    }, []);
    let qArr_unitDef = [...this._builder.container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_functionDef = [...this._builder.container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_scenario = [...this._builder.container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    
    let qArr_full = [].concat(qArr_ns, qArr_unitDef, qArr_functionDef, qArr_scenario);

    // remove unnecessary properties
    let qArr = this.omit ? qArr_full.map((q) => _omit(q, this.omit)) : qArr_full;
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '/output.json',
      type: 'text'
    }];
  }
}

module.exports = JSONExport;
