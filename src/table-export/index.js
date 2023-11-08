const { AbstractExport } = require('../core/abstract-export');
const _ = require('lodash');
const _omit = require('lodash/omit');
const _intersection = require('lodash/intersection');
const { ajv, uniqBy } = require('../utils');
const XLSX = require('xlsx');

// how to order columns in sheets
const propSequence = [
  'on', 'action', 'class', 'space', 'id', 
  'num', 'assignments.start_', 'assignments.ode_', 'units', 'boundary',
  'compartment', 'isAmount', 'actors', 'modifiers[]',
  'title', 'notes', 'tags[]'
];
// how to order sheets in file
const sheetSequence = [
  'Compartment', 'Species', 'Reaction', 'Record', 'Const',
  'Identification', 'UnitDef'
];

const schema = {
  type: 'object',
  properties: {
    omitRows: {type: 'number'},
    omit: {type: 'array', items: { type: 'string' }},
    splitByClass: {type: 'boolean'},
    bookType: {
      type: 'string',
      enum: ['xlsx', 'xlsm', 'xlsb', 'biff8', 'biff5', 'biff4', 
        'biff3', 'biff2', 'xlml', 'ods', 'fods', 
        'wk3', 'csv', 'txt', 'sylk', 'html', 
        'dif', 'dbf', 'wk1', 'rtf', 'prn', 
        'eth']
    }
  }
};

const bookTypes = {
  xlsx: {fileExt: '.xlsx', containerSheets: 'ZIP', description: 'multiExcel 2007+ XML Format'},
  xlsm: {fileExt: '.xlsm', containerSheets: 'ZIP', description: 'multiExcel 2007+ Macro XML Format'},
  xlsb: {fileExt: '.xlsb', containerSheets: 'ZIP', description: 'multiExcel 2007+ Binary Format'},
  biff8: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 97-2004 Workbook Format'},
  biff5: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 5.0/95 Workbook Format'},
  biff4: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 4.0 Worksheet Format'},
  biff3: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 3.0 Worksheet Format'},
  biff2: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 2.0 Worksheet Format'},
  xlml: {fileExt: '.xls', containerSheets: 'none', description: 'multiExcel 2003-2004 (SpreadsheetML)'},
  ods: {fileExt: '.ods', containerSheets: 'ZIP', description: 'multiOpenDocument Spreadsheet'},
  fods: {fileExt: '.fods', containerSheets: 'none', description: 'multiFlat OpenDocument Spreadsheet'},
  wk3: {fileExt: '.wk3', containerSheets: 'none', description: 'singleLotus Workbook (WK3)'},
  csv: {fileExt: '.csv', containerSheets: 'none', description: 'singleComma Separated Values'},
  txt: {fileExt: '.txt', containerSheets: 'none', description: 'singleUTF-16 Unicode Text (TXT)'},
  sylk: {fileExt: '.sylk', containerSheets: 'none', description: 'singleSymbolic Link (SYLK)'},
  html: {fileExt: '.html', containerSheets: 'none', description: 'singleHTML Document'},
  dif: {fileExt: '.dif', containerSheets: 'none', description: 'singleData Interchange Format (DIF)'},
  dbf: {fileExt: '.dbf', containerSheets: 'none', description: 'singledBASE II + VFP Extensions (DBF)'},
  wk1: {fileExt: '.wk1', containerSheets: 'none', description: 'singleLotus Worksheet (WK1)'},
  rtf: {fileExt: '.rtf', containerSheets: 'none', description: 'singleRich Text Format (RTF)'},
  prn: {fileExt: '.prn', containerSheets: 'none', description: 'singleLotus Formatted Text'},
  eth: {fileExt: '.eth', containerSheets: 'none', description: 'singleEthercalc Record Format (ETH)'}
};

class TableExport extends AbstractExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    // check arguments here
    let logger = this._container.logger;
    let valid = TableExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (q.omitRows!==undefined) this.omitRows = q.omitRows;
    if (q.spaceFilter) this.spaceFilter = q.spaceFilter;
    this.bookType = q.bookType ? q.bookType : 'csv';

    if (q.omit) this.omit = q.omit;
  }
  get className(){
    return 'TableExport';
  }
  get format(){
    return 'Table';
  }
  makeSheet(){
    // filtered namespaces
    let nsArray = [...this._container.namespaceStorage]
      .map((pair) => pair[1]);
    let nsArrayFiltered = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);
    
    // create array of flat
    let fArr_ns = nsArrayFiltered.reduce((accumulator, ns) => {
      let fArr_setns = ns.spaceName === 'nameless' ? [] : [ns.toFlat()];
      let fArr_components = ns.toArray().filter((x) => !x.isCore).map((x) => x.toFlat());
      return accumulator.concat(fArr_setns, fArr_components);
    }, []);
    let fArr_unitDef = [...this._container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat());
    let fArr_functionDef = [...this._container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat());
    let fArr_scenario = [...this._container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat());
    let fArr_full = [].concat(fArr_ns, fArr_unitDef, fArr_functionDef, fArr_scenario).map((x) => {
      x.on = 1;
      let res = {};
      Object.entries(x).forEach(([key, value]) => {
        res[key] = typeof value === 'boolean' ? value.toString() : value;
      });
      return res;
    });

    if (this.omit) {
      var fArr = fArr_full.map((q) => {
        return _omit(q, this.omit);
      });
    } else {
      fArr = fArr_full;
    }

    // split qArr to several sheets
    if (this.splitByClass) {
      let splitted = _.chain(fArr)
        .groupBy((q) => q.class)
        .mapValues((value, prop) => {
          let keys = _.chain(value) // store unique keys
            .map((x) => Object.keys(x))
            .flatten()
            .value();
          let sequence_i = _intersection(propSequence, uniqBy(keys));

          return {
            content:  value,
            pathSuffix: '',
            type: 'sheet',
            name: prop,
            headerSeq: sequence_i
          };
        })
        .toPairs()
        .sortBy((x) => { // sort in pre-defined order
          let order = sheetSequence.indexOf(x[0]);
          return order !== -1 ? order : 999;
        })
        .map(1)
        .value();
      return splitted;
    } else {
      let keys = _.chain(fArr) // store unique keys
        .map((x) => Object.keys(x))
        .flatten()
        .value();
      let sequence_out = _intersection(propSequence, uniqBy(keys));

      return [{
        content: fArr,
        pathSuffix: '',
        type: 'sheet',
        name: this.space,
        headerSeq: sequence_out
      }];
    }
  }

  make(){  
    let out = this.makeSheet();
    
    let wb = XLSX.utils.book_new();
    out.forEach((x) => {
      let omitRows = x.omitRows !== undefined
        ? x.omitRows // use omitRows from out
        : this.omitRows;
      let ws = XLSX.utils.json_to_sheet(
        Array(omitRows).fill({}).concat(x.content),
        { header: x.headerSeq, skipHeader: x.skipHeader } // XLSX tries to mutate header
      );
      XLSX.utils.book_append_sheet(wb, ws, x.name);
    });
  
    return [{
      content: XLSX.write(wb, { type: 'buffer', bookType: this.bookType}),
      type: 'buffer',
      pathSuffix: bookTypes[this.bookType].fileExt
    }];
  }

  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = TableExport;
