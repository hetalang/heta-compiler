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

class JSONExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
    
    // check arguments here
    let { logger } = this._builder;
    let valid = JSONExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.omit) this.omit = q.omit;
    if (q.useUnitsExpr) this.useUnitsExpr = q.useUnitsExpr;
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
  makeObject() {
    // filtered namespaces
    let nsArrayFiltered = this.selectedNamespaces();

    // create qArr from NS
    let qArr_ns = nsArrayFiltered.reduce((accumulator, [spaceName, ns]) => {
      let qArr_setns = ns.spaceName === 'nameless' && !ns.isAbstract ? [] : [ns.toQ()]; // skip #setNS {space: nameless};
      let qArr_components = ns.toQArr(true, { useUnitsExpr: this.useUnitsExpr });
      return accumulator.concat(qArr_setns, qArr_components);
    }, []);
    let qArr_unitDef = [...this._builder.container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ({ useUnitsExpr: this.useUnitsExpr }));
    let qArr_functionDef = [...this._builder.container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_scenario = [...this._builder.container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    
    let qArr_full = [].concat(qArr_ns, qArr_unitDef, qArr_functionDef, qArr_scenario);

    return qArr_full;
  }
  makeText(){
    let qArr_full = this.makeObject();
    
    // remove unnecessary properties
    let qArr = this.omit ? qArr_full.map((q) => omitByPaths(q, this.omit)) : qArr_full;

    let qArr_final = [{
      action: 'hasMeta',
      toolName: pkg.name,
      toolVersion: pkg.version,
      createdAt: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      format: 'JSON'
    }].concat(qArr);

    return [{
      content: JSON.stringify(qArr_final, null, 2),
      pathSuffix: '/output.heta.json',
      type: 'text'
    }];
  }
}

module.exports = JSONExport;
