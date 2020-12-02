const Container = require('../container');
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
  merge(q = {}, skipChecking){
    super.merge(q, skipChecking);
    if (q.omitRows!==undefined) this.omitRows = q.omitRows;
    if (q.splitByClass!==undefined) this.splitByClass = q.splitByClass;
    if (q.spaceFilter) this.spaceFilter = q.spaceFilter;

    if (q.omit) this.omit = q.omit;

    return this;
  }
  get className(){
    return 'XLSXExport';
  }
  make(){
    // filtered namespaces
    let nsArray = [...this.container.namespaces]
      .map((pair) => pair[1]);
    let nsOutput = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);
    let qArr = _.chain(nsOutput)
      .map((ns) => ns.toArray())
      .flatten()
      .filter((x) => !x.isCore)
      .map((x) => x.toFlat())
      .map((q) => this.omit ? _.omit(q, this.omit) : q)
      .map((x) => {
        // add on property
        x.on = 1;
        // convert boolean to string
        return _.mapValues(x, (value) => typeof value === 'boolean' ? value.toString() : value);
      })
      .value();

    // split qArr to several sheets
    if (this.splitByClass) {
      let splitted = _.chain(qArr)
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
      let keys = _.chain(qArr) // store unique keys
        .map((x) => _.keys(x))
        .flatten()
        .uniq()
        .value();
      let sequense_out = _.intersection(propSequence, keys);

      return [{
        content:  qArr,
        pathSuffix: '',
        type: 'sheet',
        name: this.space,
        headerSeq: sequense_out
      }];
    }
  }
}

Container.prototype.exports.XLSX = XLSXExport;

module.exports = { XLSXExport };
