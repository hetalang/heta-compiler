const TopoSort = require('@insysbio/topo-sort');
const { uniqBy, flatten } = require('./utils');
const HetaLevelError = require('./heta-level-error');

class Namespace extends Map {
  /**
   * Map-like storage for components belonging to one Heta namespace.
   * 
   * @class Namespace
   * @extends Map
   * 
   * @property {Container} container Parent container.
   * @property {string} _spaceName String identifier for namespace.
   * @property {boolean} _isAbstract `true` for abstract namespaces.
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
    return !!this._isAbstract;
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
   * Converts this namespace into an array of components.
   * 
   * @returns {Component[]} All components in array format.
   */
  toArray(){
    return [...this].map((x) => x[1]);
  }
  /**
   * Converts this namespace into Q-array format.
   * 
   * @param {boolean} removeCoreComponents Exclude read-only core components when `true`.
   * @param {object} options Options passed to {@link Top#toQ}.
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
   * Converts this namespace to a `setNS` Q-object.
   * 
   * @param {object} options Reserved for future versions.
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
   * Converts this namespace to flat Q-object format.
   * 
   * @param {object} options Reserved for future versions.
   * 
   * @returns {object} flat Q-object format.
   */
  toFlat(options = {}){
    let q = this.toQ(options);
    let res = flatten(q);

    return res;
  }

  /**
   * Selects components with the exact Heta class name.
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
   * Selects components that inherit from a Heta class.
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
   * Sorts namespace components by expression dependencies in one assignment context.
   * 
   * @param {string} context Assignment context such as `start_` or `ode_`.
   * @param {boolean} includeCompartmentDep Include species compartment dependencies.
   * 
   * @returns {Component[]} Components sorted by dependency order.
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
      let error = new HetaLevelError(`Circular dependency in context "${context}" for expressions: \n` + infoLine);
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
   * Selects records that have an assignment in the requested context.
   * 
   * @param {string} context Assignment context.
   * 
   * @returns {Component[]} Records that have the assignment associated with scope.
   */
  selectRecordsByContext(context){
    return this.selectByInstanceOf('Record')
      .filter((record) => record.assignments[context] !== undefined);
  }

  /**
   * Selects unique SBML units used by size-like components in this namespace.
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
   * Binds all components in this namespace.
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
   * Checks circular assignments for a context and writes errors to the container logger.
   * 
   * @param {string} scope Assignment context.
   * @param {boolean} includeCompartmentDep Include species compartment dependencies.
   *
   * @returns {void}
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
