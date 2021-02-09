const _ = require('lodash');
const XLSXExport = require('../xlsx-export');
require('./_size');

class AnotherXLSXExport extends XLSXExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);

    return this;
  }
  make(){
    // filtered namespaces
    let nsArray = [...this._container.namespaceStorage]
      .map((pair) => pair[1]);
    let nsOutput = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);
    let qArr = _.chain(nsOutput)
      .map((ns) => ns.toArray())
      .flatten()
      .filter((x) => !x.isCore && !x.instanceOf('UnitDef')) // skip core and UnitsDef
      .map((x) => x.toFlat({useAnotherUnits: true}))
      .map((q) => this.omit ? _.omit(q, this.omit) : q)
      /*
      .map((x) => {
        // add on property
        x.on = 1;
        // convert boolean to string
        return _.mapValues(x, (value) => typeof value === 'boolean' ? value.toString() : value);
      })
      */
      .value();

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

          return _.omit(q, ['class', 'units', 'units2', 'aux.reversible']);
        }), 
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          //q['#'] = counter++;
          q.st = 'r';
          if (q.isAmount!==false) q.compartment = 'no';

          return _.omit(q, ['class', 'units', 'units2', 'aux.reversible']);
        })
    );

    // Vs sheet
    let species = {
      pathSuffix: '',
      type: 'sheet',
      name: 'Vs',
      headerSeq: [
        'tags[]', 'id', 'assignments.start_', 'units2', 
        'notes', 'compartment', 'COM', 'nothing',
        'on'
      ]
    };
    species.content = [{
      'tags[]': '#', 'id': 'Variable name', 'assignments.start_': 'Value', 'units2': 'Unit', 
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
        'tags[]', 'id', 'num', 'units2',
        'notes', 'nothing', 'nothing2', 'st',
        'on'
      ]
    };
    parameters.content = [{
      'tags[]': '#', 'id': 'Parameter name', 'num': 'Value', 'units2': 'Unit',
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
        'tags[]', 'st', 'id', 'units2'
      ]
    };
    function_units.content = [{
      'tags[]': '#', 'st': '[r/f/c]?', 'id': 'ID', 'units2': 'Unit'
    }];
    function_units.content = function_units.content.concat(
      qArr.filter((q) => q.class === 'Record')
        .map((q) => {
          q.st = 'f';

          return _.pick(q, ['tags[]', 'st', 'id', 'units2']);
        })/*,
      qArr.filter((q) => q.class === 'Reaction')
        .map((q) => {
          q.st = 'r';

          return _.pick(q, ['tags[]', 'st', 'id', 'units2']);
        })*/
    );

    return [functions, species, parameters, function_units];
  }
  toQ(options = {}){
    let res = super.toQ(options);

    return res;
  }
}

module.exports = AnotherXLSXExport;
