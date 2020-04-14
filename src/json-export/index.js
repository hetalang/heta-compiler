const Container = require('../container');
const { _Export } = require('../core/_export');

class JSONExport extends _Export {
  get className(){
    return 'JSONExport';
  }
  make(){
    this.logger.reset();
    let qArr = this.namespace.toQArr(true);
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '.json',
      type: 'text'
    }];
  }
  toQ(){
    let res = super.toQ();
    return res;
  }
}

Container.prototype.exports.JSON = JSONExport;

module.exports = { JSONExport };
