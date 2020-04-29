const Container = require('../container');
const { _Export } = require('../core/_export');
const { safeDump } = require('js-yaml'); // https://www.npmjs.com/package/js-yaml
const _ = require('lodash');

class YAMLExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if(q.omit) this.omit = q.omit;

    return this;
  }
  get className(){
    return 'YAMLExport';
  }
  make(){
    let qArr = this.namespace
      .toQArr(true)
      .map((q) => this.omit ? _.omit(q, this.omit) : q);

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
  toQ(options = {}){
    let res = super.toQ(options);
    return res;
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
