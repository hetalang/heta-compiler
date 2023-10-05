const TableExport = require('../table-export');
const { ajv } = require('../utils');

const schema = {
  type: 'object',
  properties: {
    splitByClass: {type: 'boolean'},
  }
};

class XLSXExport extends TableExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = XLSXExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.splitByClass!==undefined) this.splitByClass = q.splitByClass;
    this.bookType = 'xlsx';
  }
  get className(){
    return 'XLSXExport';
  }
  get format(){
    return 'XLSX';
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = XLSXExport;
