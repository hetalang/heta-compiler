const Container = require('../container');
//const XLSX = require('xlsx'); // see docs https://docs.sheetjs.com/
const _ = require('lodash');
const { XLSXExport } = require('../xlsx-export');
require('./_size');

class AnotherXLSXExport extends XLSXExport {
  merge(q={}, skipChecking){
    super.merge(q, skipChecking);

    return this;
  }
  get className(){
    return 'AnotherXLSXExport';
  }
  make(){
    let qArr = this.namespace
      .toArray()
      .filter((x) => !x.isCore)
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

          return _.omit(q, ['class', 'units', 'unitsAnother', 'aux.reversible']);
        }), 
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          //q['#'] = counter++;
          q.st = 'r';
          if (q.isAmount!==false) q.compartment = 'no';

          return _.omit(q, ['class', 'units', 'unitsAnother', 'aux.reversible']);
        })
    );

    // Vs sheet
    let species = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Vs',
      headerSeq: [
        'tags[]', 'id', 'assignments.start_', 'unitsAnother', 
        'notes', 'compartment', 'COM', 'nothing',
        'on'
      ]
    };
    species.content = [{
      'tags[]': '#', 'id': 'Variable name', 'assignments.start_': 'Value', 'unitsAnother': 'Unit', 
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
        'tags[]', 'id', 'num', 'unitsAnother',
        'notes', 'nothing', 'nothing2', 'st',
        'on'
      ]
    };
    parameters.content = [{
      'tags[]': '#', 'id': 'Parameter name', 'num': 'Value', 'unitsAnother': 'Unit',
      'notes': 'Description', 'nothing': '', 'nothing2': '', 'st': 'string type (p/c)',
      'on': 'Scenario (2/1/0)'
    }];
    parameters.content = parameters.content.concat(
      qArr.filter((q) => q.class === 'Const')
        .map((q, i) => {
          //q['#'] = i + 1;
          q.st = 'p';

          return _.omit(q, ['class', 'units']);
        }),
      qArr.filter((q) => q.class === 'Compartment')
        .map((q, i) => {
          //q['#'] = i + 1;
          q.st = 'p';
          q.num = _.get(q, 'assignments.start_', '');

          return _.omit(q, ['class', 'units', 'assignments.start_']);
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
        'tags[]', 'st', 'id', 'unitsAnother'
      ]
    };
    function_units.content = [{
      'tags[]': '#', 'st': '[r/f/c]?', 'id': 'ID', 'unitsAnother': 'Unit'
    }];
    function_units.content = function_units.content.concat(
      qArr.filter((q) => q.class === 'Record')
        .map((q) => {
          q.st = 'f';

          return _.pick(q, ['tags[]', 'st', 'id', 'unitsAnother']);
        })/*,
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          q.st = 'r';

          return _.pick(q, ['tags[]', 'st', 'id', 'unitsAnother']);
        })*/
    );

    return [functions, species, parameters, function_units];
  }
  toQ(options = {}){
    let res = super.toQ(options);

    return res;
  }
}

Container.prototype.exports.AnotherXLSX = AnotherXLSXExport;

module.exports = {
  AnotherXLSXExport
};