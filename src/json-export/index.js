const Container = require('../container');
const { _Export } = require('../core/_export');
const _ = require('lodash');

class JSONExport extends _Export {
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    
    if(q.omit) this.omit = q.omit;

    return this;
  }
  get className(){
    return 'JSONExport';
  }
  make(){
    this.logger.reset();
    let qArr = this.namespace
      .toQArr(true)
      .map((q) => this.omit ? _.omit(q, this.omit) : q);
    
    return [{
      content: JSON.stringify(qArr, null, 2),
      pathSuffix: '.json',
      type: 'text'
    }];
  }
  toQ(options = {}){
    let res = super.toQ(options);
    return res;
  }
}

Container.prototype.exports.JSON = JSONExport;

module.exports = { JSONExport };
