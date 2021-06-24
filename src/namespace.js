const TopoSort = require('@insysbio/topo-sort');
const _ = require('lodash');
const { flatten } = require('./core/utilities');

// implicit property container, XXX: should be renamed to _container
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
        //console.log(component.id, ' => ', deps)
        graph.add(component.id, deps);
      });

    try {
      var sortedGraph = graph
        .sort()
        .reverse(); // independent should be at the beginning
    } catch(err) { // catch cycling
      // remove constants and records with num
      let infoLine = err.circular
        .map((id) => this.get(id))
        .filter((component) => {
          return component.instanceOf('Record')
            && (
              (component.getAssignment(context) !== undefined && component.getAssignment(context).num === undefined)
              || (component.getAssignment('ode_') !== undefined && component.getAssignment('ode_').num === undefined)
            ); 
        })
        .map((record) => {
          let assignment = record.getAssignment(context) || record.getAssignment('ode_');
          return `  ${record.index} <= ${assignment};`;
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
      .chain(this.selectByInstanceOf('_Size'))
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
  // This will be done again in _Export.getXXXImage()
  checkCircRecord(scope, includeCompartmentDep = false){
    let logger = this.container.logger;
    try {
      this.sortExpressionsByContext(scope, includeCompartmentDep);
    } catch (e) {
      logger.error(e.message, {type: 'CircularError'});
    }
  }
}

module.exports = {
  Namespace
};
