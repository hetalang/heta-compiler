const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');

class JSONExport extends _Export {
  get className(){
    return 'JSONExport';
  }
  make(){
    let qArr = this.namespace
      .toArray()
      .filter((x) => !x.isCore)
      .map((x) => x.toQ());
    
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

Container.prototype.classes.JSONExport = JSONExport;

module.exports = { JSONExport };
