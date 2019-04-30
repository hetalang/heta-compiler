const Container = require('../container');
const { _Export } = require('../core/_export');
const {safeDump} = require('js-yaml'); // https://www.npmjs.com/package/js-yaml

class YAMLExport extends _Export {
  get className(){
    return 'YAMLExport';
  }
  get ext(){
    return 'yml';
  }
  do(useVirtual){
    let qArr = [...this._storage]
      .filter((obj) => !obj[1].virtual || useVirtual)
      .map((obj) => obj[1].toQ());
    let order = ['class', 'id', 'title', 'notes', 'tags', 'aux'];
    let compareFunction = fromOrderToCompare(order);
    let yaml = safeDump(qArr, {
      skipInvalid: true, // TOFIX:
      flowLevel: 3,
      sortKeys: compareFunction,
      styles: {}
    });
    return yaml;
  }
  toQ(){
    let res = super.toQ();
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

Container.prototype.classes.YAMLExport = YAMLExport;

module.exports = { YAMLExport };