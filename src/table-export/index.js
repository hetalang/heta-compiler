const { AbstractExport } = require('../core/abstract-export');
const _ = require('lodash');
const { ajv, uniqBy } = require('../utils');

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
      enum: ['xlsm', 'xlsb', 'biff8', 'biff5', 'biff4', 
        'biff3', 'biff2', 'xlml', 'ods', 'fods', 
        'wk3', 'csv', 'txt', 'sylk', 'html', 
        'dif', 'dbf', 'wk1', 'rtf', 'prn', 
        'eth']
    }
  }
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
  make(){
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
    let fArr_scenario = [...this._container.scenarioStorage]
      .filter((x) => !x[1].isCore)
      .map((x) => x[1].toFlat());
    let fArr_full = [].concat(fArr_ns, fArr_unitDef, fArr_scenario).map((x) => {
      x.on = 1;
      return _.mapValues(x, (value) => typeof value === 'boolean' ? value.toString() : value);
    });

    if (this.omit) {
      var fArr = fArr_full.map((q) => {
        return _.omit(q, this.omit);
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
          let sequence_i = _.intersection(propSequence, uniqBy(keys));

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
      let sequence_out = _.intersection(propSequence, uniqBy(keys));

      return [{
        content: fArr,
        pathSuffix: '',
        type: 'sheet',
        name: this.space,
        headerSeq: sequence_out
      }];
    }
  }
  static get validate(){
    return ajv.compile(schema);
  }
}

module.exports = TableExport;
