const Container = require('../container');
const { _Export } = require('../core/_export');
const path = require('path');
const XLSX = require('xlsx'); // see docs 
const _ = require('lodash');

class XLSXExport extends _Export {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);
    if(q.omitRows!==undefined) this.omitRows = q.omitRows;
    if(q.splitByClass!==undefined) this.splitByClass = q.splitByClass;

    return this;
  }
  get className(){
    return 'XLSXExport';
  }
  makeAndSave(pathPrefix){
    let out = this.make();
    let relPath = [this.filepath || this.id, '.xlsx'].join('');
    let fullPath = path.join(pathPrefix, relPath);
    
    let wb = XLSX.utils.book_new();
    out.forEach((x) => {
      let omitRows = x.omitRows!==undefined
        ? x.omitRows // use omitRows from out 
        : this.omitRows;
      let ws = XLSX.utils.json_to_sheet(
        _.times(omitRows, {}).concat(x.content),
        { header: x.headerSeq, skipHeader: x.skipHeader } // XLSX tries to mutate header
      );
      XLSX.utils.book_append_sheet(wb, ws, x.name);
    });

    XLSX.writeFile(wb, fullPath, {});
  }
  make(){
    this.logger.reset();
    let sequense = [
      'on', 'action', 'class', 'space', 'id', 
      'num', 'assignments.start_', 'assignments.ode_', 'units', 'boundary',
      'compartment', 'isAmount', 'actors', 'modifiers[]',
      'title', 'notes', 'tags[]'
    ];

    let qArr = this.namespace
      .toArray()
      .filter((x) => !x.isCore)
      .map((x) => x.toFlat())
      .map((x) => {
        // add on property
        x.on = 1;
        // convert boolen to string
        return _.mapValues(x, (value) => typeof value === 'boolean' ? value.toString() : value);
      });

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
          let sequense_i = _.intersection(sequense, keys);

          return {
            content:  value,
            pathSuffix: '',
            type: 'sheet',
            name: prop,
            headerSeq: sequense_i
          };
        })
        .values()
        .value();
      return splitted;
    } else {
      let keys = _.chain(qArr) // store unique keys
        .map((x) => _.keys(x))
        .flatten()
        .uniq()
        .value();
      let sequense_out = _.intersection(sequense, keys);

      return [{
        content:  qArr,
        pathSuffix: '',
        type: 'sheet',
        name: this.space,
        headerSeq: sequense_out
      }];
    }
  }
  toQ(){
    let res = super.toQ();
    if(this.omitRows) res.omitRows = this.omitRows;
    if(this.splitByClass) res.splitByClass = this.splitByClass;
    return res;
  }
}

Container.prototype.exports.XLSX = XLSXExport;

module.exports = { XLSXExport };
