const Container = require('../container');
const { _Export } = require('../core/_export');
const { safeDump } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _ = require('lodash');

class YAMLExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if(q.omit) this.omit = q.omit;
    if (q.noUnitsExpr) this.noUnitsExpr = q.noUnitsExpr;
    if (q.spaceFilter) this.spaceFilter = q.spaceFilter;

    return this;
  }
  get className(){
    return 'YAMLExport';
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

Container.prototype.exports.YAML = YAMLExport;

module.exports = { YAMLExport };
