const Container = require('../container');
const { _Export } = require('../core/_export');
//const { ExportError } = require('../heta-error');
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
    let sequense = [
      'on', 'action', 'class', 'space', 'id', 
      'num', 'assignments.start_', 'assignments.ode_', 'units', 'boundary',
      'compartment', 'isAmount', 'actors', 'modifiers[]',
      'title', 'notes', 'tags[]'
    ];
    
    let wb = XLSX.utils.book_new();
    out.forEach((x) => {
      let keys = []; // store unique keys
      let content = x.content
        .map((q) => { // iterate and modify properties
          q.on = 1;
          // convert boolen to string
          return _.mapValues(q, (value, key) => {
            if (keys.indexOf(key)===-1) keys.push(key);
            return typeof value === 'boolean' ? value.toString() : value;
          });
        });

      //let sequense_i = _.cloneDeep(sequense); // many empty columns
      let sequense_i = _.intersection(sequense, keys);
      
      let ws = XLSX.utils.json_to_sheet(
        _.times(this.omitRows, {}).concat(content),
        { header: sequense_i } // XLSX tries to mutate header
      );
      XLSX.utils.book_append_sheet(wb, ws, x.name);
    });

    XLSX.writeFile(wb, fullPath, {});
  }
  make(){
    let qArr = this._container
      .getPopulation(this.space, true)
      .map((x) => x.toFlat());

    // split qArr to several sheets
    let splitted = _.chain(qArr)
      .groupBy((q) => q.class)
      .mapValues((value, prop) => {
        return {
          content: value,
          pathSuffix: '',
          type: 'sheet',
          name: prop
        };
      })
      .values()
      .value();
    
    return splitted;
  }
  toQ(){
    let res = super.toQ();
    if(this.omitRows) res.omitRows = this.omitRows;
    if(this.splitByClass) res.splitByClass = this.splitByClass;
    return res;
  }
}

Container.prototype.classes.XLSXExport = XLSXExport;

module.exports = { XLSXExport };
