const TopoSort = require('@insysbio/topo-sort');
const _ = require('lodash');
const { Expression } = require('./core/expression');
const { Record } = require('./core/record');
const { Const } = require('./core/const');
const { UnitsParser, qspUnits } = require('units-parser');
let uParser = new UnitsParser(qspUnits);

class XArray extends Array{
  getById(id){
    return this.find((x) => x.id === id);
  }
  getByIndex(index){
    return this.find((x) => x.index === index);
  }
  selectByClassName(className){
    return this.filter((x) => x.className === className);
  }
  selectByInstance(constructor){
    return this.filter((x) => x instanceof constructor);
  }
  sortExpressionsByScope(scope){
    // path to Expression based on scope
    let exprPath = 'assignments.' + scope;
    // create topo-sort tree
    let graph = new TopoSort();
    this
      .selectByClassName('Record')
      .filter((record) => _.get(record, exprPath) instanceof Expression)
      .forEach((record) => {
        let deps = _.get(record, exprPath).exprParsed.getSymbols();
        graph.add(record.id, deps);
      });

    try{
      var sortedGraph = graph
        .sort()
        .reverse(); // independent should be at the beginning
    }catch(e){ // catch cycling
      // error changes
      let infoLine = e.circular
        .map((id) => {
          let record = this.getById(id);
          let expr = _.get(record, exprPath).expr;
          return `${id}$${record.space} [${scope}]= ${expr};`;
        })
        .join('\n');
      let error = new Error(`Circular dependency in scope "${scope}" for expressions: \n` + infoLine);
      error.circular = e.circular;
      throw error;
    }

    let sorted = _.sortBy(this, (record) => sortedGraph.indexOf(record.id)); // if record not in graph than -1 and will be first

    return new XArray(...sorted); // sorted is Array, return must be XArray
  }
  /* currently not used, see _getXXXImage in Export
  expressionDeps(){
    // collect all deps, possibly helpfull for diagnostics
    let deps = _.chain(this.selectByInstance(Record)) // get list of all dependent values
      .map((record) => {
        return _.map(record.assignments, (assignment) => assignment)
          .filter((assignment) => assignment.className==='Expression');
      })
      .flatten()
      .map((expression) => expression.exprParsed.getSymbols())
      .flatten()
      .uniq()
      .difference(this.getChildrenIds()) // remove local ids from the list
      .difference(['t']) // remove time
      .value();
    return deps;
  }
  */
  selectRecordsByScope(scope){
    return this.selectByInstance(Record)
      .filter((record) => _.has(record, 'assignments.' + scope));
  }
  getListOfUnitDefinitions(){
    return this.getUniqueUnits()
      .map((units) => {
        return uParser
          .parse(units)
          .toSbmlUnitDefinition({nameStyle: 'string', simplify: true});
      });
  }
  getUniqueUnits(){
    return _.chain(this.selectByInstance(Record))
      .concat(this.selectByInstance(Const))
      .filter((record) => record.SBMLUnits())
      .uniqBy((record) => record.unitsHash(true))
      .map((record) => record.SBMLUnits())
      .value();
  }
}

module.exports = XArray;
