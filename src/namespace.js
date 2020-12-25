const TopoSort = require('@insysbio/topo-sort');
const _ = require('lodash');
const { flatten } = require('./core/utilities');

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
  toQArr(removeCoreComponents = false, options = {}){
    let qArr = this.toArray()
      .filter((x) => !(removeCoreComponents && x.isCore))
      .map((x) => x.toQ(options));
    
    return qArr;
  }
  toQ(options = {}){
    let res = {
      action: 'setNS',
      type: this.isAbstract ? 'abstract' : 'concrete',
      space: this.spaceName
    };

    return res; 
  }
  toFlat(options = {}){
    let q = this.toQ(options);
    let res = flatten(q);

    return res; 
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

    try {
      var sortedGraph = graph
        .sort()
        .reverse(); // independent should be at the beginning
    } catch(err) { // catch cycling
      // error changes
      let infoLine = err.circular
        .map((id) => {
          let record = this.get(id);
          return `${record.index} [${context}]= ${record.getAssignment(context, includeCompartmentDep).expr};`;
        })
        .join('\n');
      let error = new Error(`Circular dependency in context "${context}" for expressions: \n` + infoLine);
      error.circular = err.circular;
      throw error;
    }

    // if record not in graph than -1 and will be first
    let sorted = _.sortBy(this.toArray(), (record) => sortedGraph.indexOf(record.id)); 

    return sorted;
  }
  selectRecordsByContext(context){
    return this.selectByInstanceOf('Record')
      .filter((record) => _.has(record, 'assignments.' + context));
  }
  getUniqueUnits(){
    return _
      .chain(this.selectByInstanceOf('Record'))
      .concat(this.selectByInstanceOf('Const'))
      .filter((record) => record.unitsSBML() !== undefined)
      .uniqBy((record) => record.unitsHash(true))
      .map((record) => record.unitsSBML())
      .value();
  }
  knit(){
    this.toArray().forEach((component) => { // iterates all components
      component.bind(this);
    });
    
    return this;
  }
}

module.exports = {
  Namespace
};
