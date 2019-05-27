const TopoSort = require('@insysbio/topo-sort');
const _ = require('lodash');
const { Expression } = require('./core/expression');

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
    let exprPath = 'assignments.' + scope + '.size';
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
      var sortedBackward = graph.sort();
    }catch(e){
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
    let sortedGraph = _.reverse(sortedBackward); // independent should be at the beginning
    let sorted = _.sortBy(this, (record) => sortedGraph.indexOf(record.id)); // if record not in graph than -1 and will be first

    return new XArray(...sorted); // sorted is Array, return must be XArray
  }
}

module.exports = XArray;
