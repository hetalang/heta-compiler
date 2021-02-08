const Container = require('../container');
const { _Export } = require('../core/_export');
const _ = require('lodash');

class JSONExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if (q.omit) this.omit = q.omit;
    if (q.noUnitsExpr) this.noUnitsExpr = q.noUnitsExpr;
    if (q.spaceFilter) this.spaceFilter = q.spaceFilter;

    return this;
  }
  get className(){
    return 'JSONExport';
  }
  make(){
    // filtered namespaces
    let nsArray = [...this.container.namespaces]
      .map((pair) => pair[1]);
    let nsArrayFiltered = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);

    // create qArr from NS
    let qArr_ns = nsArrayFiltered.reduce((accumulator, ns) => {
      let qArr_setns = ns.spaceName === 'nameless' ? [] : [ns.toQ()]; // skip default NS
      let qArr_components = ns.toQArr(true, { noUnitsExpr: this.noUnitsExpr });
      return accumulator.concat(qArr_setns, qArr_components);
    }, []);
    let qArr_unitDef = [...this.container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toQ());
    let qArr_full = [].concat(qArr_ns, qArr_unitDef);

    // remove unnecessary properties
    let qArr = this.omit ? qArr_full.map((q) => _.omit(q, this.omit)) : qArr_full;
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '.json',
      type: 'text'
    }];
  }
}

Container.prototype.exports.JSON = JSONExport;

module.exports = { JSONExport };
