const Container = require('../container');
//const { ExportError } = require('../heta-error');
//const XLSX = require('xlsx'); // see docs 
const _ = require('lodash');
const { XLSXExport } = require('../xlsx-export');
require('./record');

class GSKXLSXExport extends XLSXExport {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'GSKXLSXExport';
  }
  make(){
    let qArr = this._container
      .getPopulation(this.space, true)
      .map((x) => x.toFlat());

    // main_tab sheet
    let functions = {
      pathSuffix: '',
      type: 'sheet',
      name: 'main_tab',
      headerSeq: ['#', 'st', 'id', 'actors', 'assignments.ode_', 'compartment', 'notes']
    };
    functions.content = [{'#': '#', 'id': 'ID', 'assignments.ode_': 'Rate Law/formulae', 'actors': 'Reaction', 'compartment': 'Compartment', 'notes': 'Description', 'st': '[r/f/c]?'}];
    let counter = 1;
    functions.content = functions.content.concat(
      qArr.filter((q) => q.class === 'Record')
        .map((q) => {
          q['#'] = counter++;
          q.st = 'f';
          delete q.class;
          delete q.on;
          delete q.units;

          return q;
        }), 
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          q['#'] = counter++;
          q.st = 'r';
          delete q.class;
          delete q.on;
          delete q.units;

          return q;
        })
    );

    // Vs sheet
    let species = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Vs',
      headerSeq: ['#', 'id', 'assignments.start_', 'unitsSimbio', 'notes', 'compartment', 'COM']
    };
    species.content = [{'#': '#', 'id': 'Variable name', 'assignments.start_': 'Value', 'unitsSimbio': 'Unit', 'notes': 'Description', 'compartment': 'Compartment', 'COM': 'COM'}];
    species.content = species.content.concat(
      qArr.filter((q) => q.class === 'Species')
        .map((q, i) => {
          q['#'] = i + 1;
          delete q.class;
          delete q.on;
          delete q.units;

          return q;
        })
    );

    // Ps sheet
    let parameters = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Ps',
      headerSeq: ['#', 'id', 'num', 'unitsSimbio', 'notes', 'st']
    };
    parameters.content = [{'#': '#', 'id': 'Parameter name', 'num': 'Value', 'unitsSimbio': 'Unit', 'notes': 'Description', 'st': 'string type (p/c)'}];
    parameters.content = parameters.content.concat(
      qArr.filter((q) => q.class === 'Const')
        .map((q, i) => {
          q['#'] = i + 1;
          q.st = 'p';
          delete q.class;
          delete q.on;
          delete q.units;

          return q;
        })
    );

    return [functions, species, parameters];
  }
  toQ(){
    let res = super.toQ();

    return res;
  }
}

Container.prototype.classes.GSKXLSXExport = GSKXLSXExport;

module.exports = {
  GSKXLSXExport
};
