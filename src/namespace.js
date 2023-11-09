const TopoSort = require('@insysbio/topo-sort');
const { uniqBy, flatten } = require('./utils');

class Namespace extends Map {
  /**
   * Namespace is a `Map` which stores components.
   * 
   * @extends Map
   * 
   * @property {Container} container Parent container.
   * @property {string} _spaceName String identifier for namespace.
   * @property {boolean} _isAbstract `true` if  namespace is abstract. `false` otherwise.
   * 
   * @param {string} spaceName Space identifier.
   */
  constructor(spaceName){ 
    super();
    //if (typeof spaceName !== 'string')
    //  throw new TypeError(`spaceName argument must be string, got ${spaceName}`);
    this._spaceName = spaceName;
  }
  /**
   * `true` if namespace is abstract, `false` if concrete.
   */
  get isAbstract(){
    return this._isAbstract;
  }
  /**
   * Identifier of a namespace.
   */
  get spaceName(){
    return this._spaceName;
  }
  set(key, value){
    return super.set(key, value);
  }
  /**
   * Converts namespace into array of components.
   * 
   * @returns {Component[]} All components in array format.
   */
  toArray(){
    return [...this].map((x) => x[1]);
  }
  /**
   * Converts namespace into Q-array.
   * 
   * @param {boolean} removeCoreComponents=true 
   * @param {object} options Options passed to {@link Top#toQ} method
   * 
   * @returns {object[]} Q-array format.
   */
  toQArr(removeCoreComponents = false, options = {}){
    let qArr = this.toArray()
      .filter((x) => !(removeCoreComponents && x.isCore))
      .map((x) => x.toQ(options));
    
    return qArr;
  }
  /**
   * Representation of namespace into Q-object format.
   * 
   * @param {object} options reserved for future versions.
   * @returns {object} JS object in Q-object format.
   */
  toQ(options = {}){
    let res = {
      action: 'setNS',
      type: this.isAbstract ? 'abstract' : 'concrete',
      space: this.spaceName
    };

    return res; 
  }

  /**
   * Representation of namespace in flat Q-object format.
   * 
   * @param {object} options reserved for future versions.
   * 
   * @returns {object} flat Q-object format.
   */
  toFlat(options = {}){
    let q = this.toQ(options);
    let res = flatten(q);

    return res;
  }

  /**
   * Components of the particular class.
   * 
   * @param {string} className One of available Heta classes: 'Const', 'Record', etc.
   * 
   * @returns {Component[]} Array of selected components.
   */
  selectByClassName(className){
    return this
      .toArray()
      .filter((x) => x.className === className);
  }

  /**
   * Components of the class and its inheritors.
   * 
   * @param {string} className One of available Heta classes: 'Const', 'Record', etc.
   * 
   * @returns {Component[]} Array of selected components.
   */
  selectByInstanceOf(className){
    return this
      .toArray()
      .filter((x) => x.instanceOf(className));
  }

  /**
   * Select all records from namespace and sort them by the scope.
   * 
   * @param {string} context scope of `Record`.
   * @param {boolean} includeCompartmentDep=true
   * 
   * @returns {Component[]} Records in scope order.
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
          return `  ${record.index} ~ ${assignment};`;
        })
        .join('\n');
      let error = new Error(`Circular dependency in context "${context}" for expressions: \n` + infoLine);
      error.circular = err.circular;
      throw error;
    }

    // if record not in graph than -1 and will be first
    let sortedSizes = this.toArray()
      .sort((a, b) => sortedGraph.indexOf(a.id) - sortedGraph.indexOf(b.id));
    
    return sortedSizes;
  }

  /**
   * 
   * Select all records which have the scope.
   * 
   * @param {string} context scope of `Record`.
   * 
   * @returns {Component[]} Records that have the assignment associated with scope.
   */
  selectRecordsByContext(context){
    return this.selectByInstanceOf('Record')
      .filter((record) => record.assignments[context] !== undefined);
  }

  /**
   * Select all units mentioned in namespace.
   * 
   * @returns {Unit[]} Array of units.
   */
  getUniqueUnits(){
    let sizesWithUnits = this.selectByInstanceOf('_Size')
      .filter((record) => record.unitsSBML() !== undefined);

    return uniqBy(sizesWithUnits, (record) => record.unitsHash(true))
      .map((record) => record.unitsSBML());
  }

  /**
   * Sequential checking and binding components.
   * 
   * @returns {Namespace} Self.
   */
  knit(){
    this.toArray().forEach((component) => { // iterates all components
      component.bind(this);
    });
    
    return this;
  }

  // This will be done again in _Export.getXXXImage()
  /**
   * Check if there are circular assignments for the `scope`.
   * Write errors in logger.
   * 
   * @param {string} scope selected assignment scope.
   * @param {boolean} includeCompartmentDep=true To take into account Compartment (for `Species` only).
   */
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
