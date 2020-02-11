const TopoSort = require('@insysbio/topo-sort');
const _ = require('lodash');

class Namespace extends Map {
  constructor(spaceName){
    super();
    //if (typeof spaceName !== 'string')
    //  throw new TypeError(`spaceName argument must be string, got ${spaceName}`);

    this._spaceName = spaceName;
  }
  get isAbstract(){
    return this._isAbstract;
  }
  // title of space
  get spaceName(){
    return this._spaceName;
  }
  set(key, value){
    return super.set(key, value);
  }
  toArray(){
    return [...this].map((x) => x[1]);
  }
  toQArr(removeCoreComponents = false){
    let qArr = this.toArray()
      .filter((x) => !removeCoreComponents || !x.isCore)
      .map((x) => x.toQ());
    
    return qArr;
  }
  selectByClassName(className){
    return this
      .toArray()
      .filter((x) => x.className === className);
  }
  selectByInstanceOf(className){
    return this
      .toArray()
      .filter((x) => x.instanceOf(className));
  }
  /*
  */
  sortExpressionsByContext(context, includeCompartmentDep = false){
    // create topo-sort tree
    let graph = new TopoSort();
    this
      .selectByInstanceOf('Record')
      .forEach((component) => {
        let deps = component.dependOn(context, includeCompartmentDep);
        graph.add(component.id, deps);
      });

    try{
      var sortedGraph = graph
        .sort()
        .reverse(); // independent should be at the beginning
    }catch(e){ // catch cycling
      // path to Expression based on context
      let exprPath = 'assignments.' + context;
      // error changes
      let infoLine = e.circular
        .map((id) => {
          let record = this.getById(id);
          let expr = _.get(record, exprPath).expr;
          return `${record.space}::${id} [${context}]= ${expr};`;
        })
        .join('\n');
      let error = new Error(`Circular dependency in context "${context}" for expressions: \n` + infoLine);
      error.circular = e.circular;
      throw error;
    }

    let sorted = _.sortBy(this.toArray(), (record) => sortedGraph.indexOf(record.id)); // if record not in graph than -1 and will be first

    return sorted; // sorted is Array, return must be XArray
  }
  selectRecordsByContext(context){
    return this.selectByInstanceOf('Record')
      .filter((record) => _.has(record, 'assignments.' + context));
  }
  getUniqueUnits(){
    return _
      .chain(this.selectByInstanceOf('Record'))
      .concat(this.selectByInstanceOf('Const'))
      .filter((record) => record.unitsSBML()!==undefined)
      .uniqBy((record) => record.unitsHash(true))
      .map((record) => record.unitsSBML())
      .value();
  }
  knit(skipErrors = false){
    this.toArray().forEach((component) => { // iterates all components
      component.bind(this, skipErrors);
    });

    return this;
  }
}

module.exports = {
  Namespace
};
