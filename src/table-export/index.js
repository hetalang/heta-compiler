const { AbstractExport } = require('../abstract-export');
const pkg = require('../../package');
const { intersection, omitByPaths } = require('../utils');
const { ajv } = require('../ajv');
const XLSX = require('xlsx');

// how to order columns in sheets
const propSequence = [
  'on', 'action', 'class', 'space', 'id', 
  'num', 'assignments.start_', 'assignments.ode_', 'units', 'boundary', 'ss',
  'compartment', 'isAmount', 'actors', 'modifiers[]',
  'title', 'notes', 'tags[]'
];
// how to order sheets in file
const sheetSequence = [
  'Compartment', 'Species', 'Reaction', 'Record', 'Const',
  'Identification'
];

const schema = {
  type: 'object',
  properties: {
    omitRows: {type: 'integer', minimum: 0},
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
  xlsx: {fileExt: '.xlsx', containerSheets: 'ZIP', description: 'multiExcel 2007+ XML Format', multischeet: true},
  xlsm: {fileExt: '.xlsm', containerSheets: 'ZIP', description: 'multiExcel 2007+ Macro XML Format', multischeet: true},
  xlsb: {fileExt: '.xlsb', containerSheets: 'ZIP', description: 'multiExcel 2007+ Binary Format', multischeet: true},
  biff8: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 97-2004 Workbook Format', multischeet: true},
  biff5: {fileExt: '.xls', containerSheets: 'CFB', description: 'multiExcel 5.0/95 Workbook Format', multischeet: true},
  biff4: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 4.0 Worksheet Format', multischeet: true},
  biff3: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 3.0 Worksheet Format', multischeet: true},
  biff2: {fileExt: '.xls', containerSheets: 'none', description: 'singleExcel 2.0 Worksheet Format', multischeet: true},
  xlml: {fileExt: '.xls', containerSheets: 'none', description: 'multiExcel 2003-2004 (SpreadsheetML)', multischeet: true},
  ods: {fileExt: '.ods', containerSheets: 'ZIP', description: 'multiOpenDocument Spreadsheet', multischeet: true},
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
    let { logger } = this._builder;
    let valid = TableExport.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    this.omitRows = q.omitRows || 0;
    this.bookType = q.bookType || 'csv';
    if (q.splitByClass!==undefined) this.splitByClass = q.splitByClass;

    if (q.omit) this.omit = q.omit;
  }
  get className(){
    return 'TableExport';
  }
  get defaultFilepath() {
    return 'table';
  }
  get format(){
    return 'Table';
  }
  makeSheet(){
    // filtered namespaces
    let nsArrayFiltered = [...this._builder.container.namespaceStorage]
      .filter(([spaceName, ns]) => new RegExp(this.spaceFilter).test(spaceName))
      .map(([spaceName, ns]) => ns);
    
    // create array of flat
    let fArr_ns = nsArrayFiltered.reduce((accumulator, ns) => {
      let fArr_setns = ns.spaceName === 'nameless' ? [] : [ns.toFlat()];
      let fArr_components = ns.toArray().filter((x) => !x.isCore).map((x) => x.toFlat({ useUnitsExpr: true }));
      return accumulator.concat(fArr_setns, fArr_components);
    }, []);
    let fArr_unitDef = [...this._builder.container.unitDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat({ useUnitsExpr: true }));
    let fArr_functionDef = [...this._builder.container.functionDefStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat());
    let fArr_scenario = [...this._builder.container.scenarioStorage]
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
        return omitByPaths(q, this.omit);
      });
    } else {
      fArr = fArr_full;
    }

    let fArr_final = [{
      action: 'hasMeta',
      toolName: pkg.name,
      toolVersion: pkg.version,
      createdAt: new Date().toISOString(),
      platformId: this._builder.id,
      platformVersion: this._builder.version,
      format: 'Table',
    }].concat(fArr);

    // split qArr to several sheets
    if (this.splitByClass) {
      let splittedObj = fArr_final.reduce((accumulator, value) => {
        let c = value.class + '';
        !accumulator[c] && (accumulator[c] = []);
        accumulator[c].push(value);
        return accumulator;
      }, {});
      let splitted = Object.entries(splittedObj)
        .sort((a, b) => { // soft but unknown element will be last
          let indexA = sheetSequence.indexOf(a[0]);
          let indexB = sheetSequence.indexOf(b[0]);
          if (indexA === -1 && indexB !== -1) {
            return 1;
          } else if (indexA !== -1 && indexB === -1) {
            return -1;
          } else {
            return indexA - indexB;
          }
        })
        .map(([name, value], i) => {
          let keys = value.map((x) => Object.keys(x)).flat(); // all headers

          return {
            content:  value,
            pathSuffix: `#${i}`, // starting from 0
            type: 'sheet',
            name: name,
            headerSeq: intersection(propSequence, keys)
          };
        });

      return splitted;
    } else {
      let keys = fArr_final // store unique keys
        .map((x) => Object.keys(x))
        .flat();
      let sequence_out = intersection(propSequence, keys);

      return [{
        content: fArr_final,
        pathSuffix: '#0',
        type: 'sheet',
        name: 'output',
        headerSeq: sequence_out
      }];
    }
  }

  make(){  
    let out = this.makeSheet();
    
    let wb = XLSX.utils.book_new();
    out.forEach((x) => {
      let ws = XLSX.utils.json_to_sheet(
        Array(this.omitRows).fill({}).concat(x.content),
        { header: x.headerSeq, skipHeader: x.skipHeader } // XLSX tries to mutate header
      );
      XLSX.utils.book_append_sheet(wb, ws, x.name);
    });

    let bookType = bookTypes[this.bookType];

    if (bookType.multischeet) {
      return [{
        content: XLSX.write(wb, { type: 'buffer', bookType: this.bookType}),
        type: 'buffer',
        pathSuffix: '/output.heta' + bookType.fileExt
      }];
    } else {
      return wb.SheetNames.map((key, i) => {
        return {
          content: XLSX.write(wb, { type: 'buffer', bookType: this.bookType, sheet: i}),
          type: 'buffer',
          pathSuffix: '/' + key + '.heta' + bookType.fileExt
        };
      });
    }
  

  }

  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = TableExport;
