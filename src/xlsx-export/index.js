const { _Export } = require('../core/_export');
const _ = require('lodash');
// how to order columns in scheets
const propSequence = [
  'on', 'action', 'class', 'space', 'id', 
  'num', 'assignments.start_', 'assignments.ode_', 'units', 'boundary',
  'compartment', 'isAmount', 'actors', 'modifiers[]',
  'title', 'notes', 'tags[]'
];
// how to order scheets in file
const scheetSequence = [
  'Compartment', 'Species', 'Reaction', 'Record', 'Const',
  'Identification', 'UnitDef'
];

class XLSXExport extends _Export {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    if (q.omitRows!==undefined) this.omitRows = q.omitRows;
    if (q.splitByClass!==undefined) this.splitByClass = q.splitByClass;
    if (q.spaceFilter) this.spaceFilter = q.spaceFilter;

    if (q.omit) this.omit = q.omit;

    return this;
  }
  make(){
    // filtered namespaces
    let nsArray = [...this._container.namespaces]
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
    let fArr_full = [].concat(fArr_ns, fArr_unitDef).map((x) => {
      x.on = 1;
      return _.mapValues(x, (value) => typeof value === 'boolean' ? value.toString() : value);
    });

    let fArr = this.omit ? fArr_full.map((q) => _.omit(q, this.omit)) : fArr_full;

    // split qArr to several sheets
    if (this.splitByClass) {
      let splitted = _.chain(fArr)
        .groupBy((q) => q.class)
        .mapValues((value, prop) => {
          let keys = _.chain(value) // store unique keys
            .map((x) => _.keys(x))
            .flatten()
            .uniq()
            .value();
          let sequense_i = _.intersection(propSequence, keys);

          return {
            content:  value,
            pathSuffix: '',
            type: 'sheet',
            name: prop,
            headerSeq: sequense_i
          };
        })
        .toPairs()
        .sortBy((x) => { // sort in pre-defined order
          let order = scheetSequence.indexOf(x[0]);
          return order !== -1 ? order : 999;
        })
        .map(1)
        .value();
      return splitted;
    } else {
      let keys = _.chain(fArr) // store unique keys
        .map((x) => _.keys(x))
        .flatten()
        .uniq()
        .value();
      let sequense_out = _.intersection(propSequence, keys);

      return [{
        content: fArr,
        pathSuffix: '',
        type: 'sheet',
        name: this.space,
        headerSeq: sequense_out
      }];
    }
  }
}

module.exports = XLSXExport;
