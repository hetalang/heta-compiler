const TableExport = require('../table-export');

class XLSXExport extends TableExport {
  constructor(q = {}, isCore = false) {
    super(q, isCore);
    
    this.bookType = 'xlsx';
  }
  get className() {
    return 'XLSXExport';
  }
  get defaultFilepath() {
    return 'xlsx';
  }
  get format() {
    return 'xlsx';
  }
}

module.exports = XLSXExport;
