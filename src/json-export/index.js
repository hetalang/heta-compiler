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
    let nsOutput = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);
    let qArr = _.chain(nsOutput)
      .map((ns) => ns.toQArr(true, { noUnitsExpr: this.noUnitsExpr }))
      .flatten()
      .map((q) => this.omit ? _.omit(q, this.omit) : q)
      .value();
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '.json',
      type: 'text'
    }];
  }
}

Container.prototype.exports.JSON = JSONExport;

module.exports = { JSONExport };
