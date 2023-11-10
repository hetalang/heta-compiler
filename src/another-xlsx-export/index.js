const _omit = require('lodash/omit');
const XLSXExport = require('../xlsx-export');
require('./_size');

class AnotherXLSXExport extends XLSXExport {
  constructor(q = {}, isCore = false){
    super(q, isCore);
  }
  get className(){
    return 'AnotherXLSXExport';
  }
  get format(){
    return 'Another';
  }
  makeSheet(){
    // filtered namespaces
    let nsArray = [...this._container.namespaceStorage]
      .map((pair) => pair[1]);
    let nsOutput = typeof this.spaceFilter === 'undefined'
      ? nsArray
      : nsArray.filter((ns) => this.spaceFilter.indexOf(ns.spaceName) !== -1);

    let qArr = nsOutput
      .map((ns) => ns.toArray())
      .flat(Infinity)
      .filter((x) => !x.isCore && !x.instanceOf('UnitDef'))
      .map((x) => x.toFlat({useAnotherUnits: true}))
      .map((q) => this.omit ? _omit(q, this.omit) : q);

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
        .map((_q) => {
          //q['#'] = counter++;
          let q = {st: 'f', ..._q};
          delete q.class;
          delete q.units;
          delete q.units2;
          delete q.reversible;

          return q;
        }), 
      qArr.filter((q) => q.class === 'Reaction')
        .map((_q) => {
          //q['#'] = counter++;
          let q = {st: 'r', ..._q};
          if (q.isAmount !== false) q.compartment = 'no';
          delete q.class;
          delete q.units;
          delete q.units2;
          delete q.reversible;

          return q;
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
        .map((_q, i) => {
          //q['#'] = i + 1;
          let q = {..._q};
          delete q.class;
          delete q.units;

          return q;
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
        .map((_q, i) => {
          //q['#'] = i + 1;
          let q = {st: 'p', ..._q};
          delete q.class;
          delete q.units;

          return q;
        }),
      qArr.filter((q) => q.class === 'Compartment')
        .map((_q, i) => {
          //q['#'] = i + 1;
          let q = {st: 'p', num: (_q.assignments?.start_ || ''), ..._q};
          delete q.class;
          delete q.units;
          delete q.assignments?.start_;

          return q;
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
      qArr.filter((q) => q.class === 'Record').map((q) => {
        return {
          st: 'f',
          'tags[]': q['tags[]'],
          id: q.id,
          units2: q.units2
        };
      })
    );

    return [functions, species, parameters, function_units];
  }
}

module.exports = AnotherXLSXExport;
