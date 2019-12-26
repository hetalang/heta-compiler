const Container = require('../container');
//const { ExportError } = require('../heta-error');
//const XLSX = require('xlsx'); // see docs https://docs.sheetjs.com/
const _ = require('lodash');
const { XLSXExport } = require('../xlsx-export');
require('./_size');

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
      headerSeq: [
        'tags[]', 'st', 'id', 'actors',
        'assignments.ode_', 'compartment', 'notes', 'nothing',
        'on'
      ]
    };
    functions.content = [{
      'tags[]': '#', 'st': '[r/f/c]?', 'id': 'ID', 'assignments.ode_': 'Rate Law/formulae',
      'actors': 'Reaction', 'compartment': 'Compartment', 'notes': 'Description', 'nothing': 'CHANGE', 
      'on': 'Scenario (2/1/0)'
    }];
    //let counter = 1;
    functions.content = functions.content.concat(
      qArr.filter((q) => q.class === 'Record')
        .map((q) => {
          //q['#'] = counter++;
          q.st = 'f';

          return _.omit(q, ['class', 'units', 'unitsGSK', 'aux.reversible']);
        }), 
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          //q['#'] = counter++;
          q.st = 'r';
          if (q.isAmount!==false) q.compartment = 'no';

          return _.omit(q, ['class', 'units', 'unitsGSK']);
        })
    );

    // Vs sheet
    let species = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Vs',
      headerSeq: [
        'tags[]', 'id', 'assignments.start_', 'unitsGSK', 
        'notes', 'compartment', 'COM', 'nothing',
        'on'
      ]
    };
    species.content = [{
      'tags[]': '#', 'id': 'Variable name', 'assignments.start_': 'Value', 'unitsGSK': 'Unit', 
      'notes': 'Description', 'compartment': 'Compartment', 'COM': 'COM', 'nothing': '',
      'on': 'Scenario (2/1/0)'
    }];
    species.content = species.content.concat(
      qArr.filter((q) => q.class === 'Species')
        .map((q, i) => {
          //q['#'] = i + 1;

          return _.omit(q, ['class', 'units']);
        })
    );

    // Ps sheet
    let parameters = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Ps',
      headerSeq: [
        'tags[]', 'id', 'num', 'unitsGSK',
        'notes', 'nothing', 'nothing2', 'st',
        'on'
      ]
    };
    parameters.content = [{
      'tags[]': '#', 'id': 'Parameter name', 'num': 'Value', 'unitsGSK': 'Unit',
      'notes': 'Description', 'nothing': '', 'nothing2': '', 'st': 'string type (p/c)',
      'on': 'Scenario (2/1/0)'
    }];
    parameters.content = parameters.content.concat(
      qArr.filter((q) => q.class === 'Const')
        .map((q, i) => {
          //q['#'] = i + 1;
          q.st = 'p';

          return _.omit(q, ['class', 'units']);
        })
    );

    
    // function units sheet
    let function_units = {
      omitRows: 0,
      skipHeader: true,
      pathSuffix: '',
      type: 'sheet',
      name: 'function units',
      headerSeq: [
        'tags[]', 'st', 'id', 'unitsGSK'
      ]
    };
    function_units.content = [{
      'tags[]': '#', 'st': '[r/f/c]?', 'id': 'ID', 'unitsGSK': 'Unit'
    }];
    function_units.content = function_units.content.concat(
      qArr.filter((q) => q.class === 'Record')
        .map((q) => {
          q.st = 'f';

          return _.pick(q, ['tags[]', 'st', 'id', 'unitsGSK']);
        })/*,
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          q.st = 'r';

          return _.pick(q, ['tags[]', 'st', 'id', 'unitsGSK']);
        })*/
    );

    return [functions, species, parameters, function_units];
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
