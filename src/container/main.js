// Top classes
const { Top } = require('../core/top');
const { UnitDef } = require('../core/unit-def');
const { FunctionDef } = require('../core/function-def');
const { Scenario } = require('../core/scenario');
// Component classes
const { Component } = require('../core/component');
const { Record } = require('../core/record');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const { Process } = require('../core/process');
const { DSwitcher } = require('../core/d-switcher');
const { StopSwitcher } = require('../core/stop-switcher');
const { CSwitcher } = require('../core/c-switcher');
const { TimeSwitcher } = require('../core/time-switcher');
const { ReferenceDefinition } = require('../core/reference-definition');
const { Page } = require('../core/page');
const { Const } = require('../core/const');
const { TimeScale } = require('../core/time-scale');
// external
const { Logger, JSONTransport } = require('../logger');
const coreItems = require('./core-items.json');
const TopoSort = require('@insysbio/topo-sort');

/**
 * The main class storing a modeling platform and it's methods.
 * 
 * It is highly recommended to use only one container instance in developed code.
 * 
 * @class Container
 * 
 * @property {object} classes Map-like storage for all element constructors that can be created inside platform.
 *    For example the element of the type `UnitsDef` can be created as follows:
 *    ```let new_unit = new c.classes.UnitDef().merge({id: 'new', units: 'g/litre'})```
 *    The `new_unit` element will be automatically bound to the container and pushed to `unitDefStorage`.
 * @property {Logger} logger object providing transport of errors, warnings and info messages on Heta platform level.
 * @property {object[]} defaultLogs Default storage of errors which will be used for diagnostics.
 *    The {@link JSONTransport} is used here.
 * @property {Map<string,UnitDef>} unitDefStorage Storage for `UnitDef` instances. Key is a string identifier.
 * @property {Map<string,FunctionDef>} functionDefStorage Storage for `FunctionDef` instances. Key is a string identifier.
 * @property {Map<string,Scenario>} scenarioStorage Storage for `Scenario` instances. Key is a string identifier.
 * @property {Map<string,Namespace>} namespaceStorage Storage for `Namespace` instances. Key is a string identifier.
 *    There is a default namespace with identifier `nameless` which will be used as a default namespace 
 *    for all components where namespace name is not set.
 * @property {object} _builder reference to the parent builder object (if exists).
 */
class Container {
  /* constructor can be run many times */
  constructor(){
    // create personal storage for all bound classes
    this.classes = {};
    // create classes bound to this container
    this.classes.Top = class extends Top {}; // only for testing
    this.classes.Top.prototype._container = this; // only for testing
    this.classes.UnitDef = class extends UnitDef {};
    this.classes.UnitDef.prototype._container = this;
    this.classes.FunctionDef = class extends FunctionDef {};
    this.classes.FunctionDef.prototype._container = this;
    this.classes.Scenario = class extends Scenario {};
    this.classes.Scenario.prototype._container = this;
    //
    this.classes.Component = class extends Component {};
    this.classes.Component.prototype._container = this;
    this.classes.Record = class extends Record {};
    this.classes.Record.prototype._container = this;
    this.classes.Compartment = class extends Compartment {};
    this.classes.Compartment.prototype._container = this;
    this.classes.Species = class extends Species {};
    this.classes.Species.prototype._container = this;
    this.classes.Reaction = class extends Reaction {};
    this.classes.Reaction.prototype._container = this;
    this.classes.Process = class extends Process {};
    this.classes.Process.prototype._container = this;
    this.classes.DSwitcher = class extends DSwitcher {};
    this.classes.DSwitcher.prototype._container = this;
    this.classes.StopSwitcher = class extends StopSwitcher {};
    this.classes.StopSwitcher.prototype._container = this;
    this.classes.CSwitcher = class extends CSwitcher {};
    this.classes.CSwitcher.prototype._container = this;
    this.classes.TimeSwitcher = class extends TimeSwitcher {};
    this.classes.TimeSwitcher.prototype._container = this;
    this.classes.ReferenceDefinition = class extends ReferenceDefinition {};
    this.classes.ReferenceDefinition.prototype._container = this;
    this.classes.Page = class extends Page {};
    this.classes.Page.prototype._container = this;
    this.classes.Const = class extends Const {};
    this.classes.Const.prototype._container = this;
    this.classes.TimeScale = class extends TimeScale {};
    this.classes.TimeScale.prototype._container = this;  

    // logger
    this.logger = new Logger();
    this.defaultLogs = []; // storing logs in JSON-like format here
    this.logger.addTransport(new JSONTransport('info', this.defaultLogs));

    // storage for UnitDef
    this.unitDefStorage = new Map();
    // storage for FunctionDef
    this.functionDefStorage = new Map();
    // storage for Scenario
    this.scenarioStorage = new Map();
    // storage of Namespaces
    this.namespaceStorage = new Map();

    // create default namespace
    /*
    let nameless = new Namespace('nameless');
    nameless.container = this;
    nameless._isAbstract = false;
    this.namespaceStorage.set('nameless', nameless);
    */
    this.setNS({space: 'nameless'});

    // XXX: this is bad solution because if errors exist then will be errors without logs
    // load core items
    this.loadMany(coreItems, true);
    //console.log(this.defaultLogs)
  }

  /**
   * Returns array of errors from the default logger.
   * 
   * @method Container#hetaErrors
   * 
   * @returns {object[]} See details in {@link JSONTransport}
   */
  hetaErrors(){
    return this.defaultLogs
      .filter(x => x.levelNum >= 3);
  }

  /**
   * Runs an action (like creating a component) based on `q.action` property.
   * If `q.action` is not set than apply "upsert".
   * An "action" name should be set as a name of the `Container` method. 
   * 
   * This is the main method to convert from Q-object into platform elements.
   * 
   * @param {object} q Simple object with the same structure as Heta plain format.
   * @param {boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
   * 
   * @returns {Container} This function returns the container.
   */
  load(q, isCore = false){
    // estimate action, default is upsert
    let actionName = q.action || 'upsert';
    if (!this[actionName] || typeof this[actionName] !== 'function') {
      this.logger.error(
        `Action #${actionName} is unknown and will be skipped.`,
        {type: 'QError', action: actionName}
      );
      return;
    }
    // normal flow
    return this[actionName](q, isCore);
  }

  /**
   * Runs {@link Container#load} method many times for each element of `qArr` vector sequentially.
   * 
   * @param {object[]} qArr Q-array.
   * @param {boolean} isCore Set element as a "core" which means you cannot rewrite or delete it.
   * 
   * @returns {Container} This function returns the container.
   */
  loadMany(qArr, isCore = false){
    qArr.forEach((q) => this.load(q, isCore));
    return this;
  }

  /**
   * Get number of total elements of a platform.
   * 
   * @returns {number} Total number of components + `UnitDef` + `Functiondef` + `Scenario`.
   */
  get length(){
    return [...this.namespaceStorage].reduce((acc, x) => acc + x[1].size, 0) // number of components in all namespaces
        + this.unitDefStorage.size // number of UnitDef
        + this.functionDefStorage.size // number of FunctionDef
        + this.scenarioStorage.size; // number of Scenario
  }

  /**
   * Creates references between elements in a platform.
   * It includes all concrete namespaces and `UnitDef` instances.
   * 
   * @returns {Container} This function returns the container.
   */
  knitMany(){
    // knit unitDef
    this.unitDefStorage.forEach((ud) => ud.bind());
    // knit functionDef
    this.functionDefStorage.forEach((fd) => fd.bind());
    // knit components, only for concrete namespace
    this.namespaceStorage.forEach((ns) => !ns.isAbstract && ns.knit());
    // knit scenario
    this.scenarioStorage.forEach((sc) => sc.bind());

    return this;
  }

  /**
   * Checks circular ref in UnitDef
   * 
   * @returns {Container} This function returns the container.
   */
  checkCircUnitDef(){
    // the same method as for sortExpressionsByContext()
    let graph = new TopoSort();
    this.unitDefStorage.forEach((unitDef) => {
      if (unitDef.unitsParsed !== undefined) {
        let deps = unitDef.unitsParsed.map((x) => x.kind);
        graph.add(unitDef.id, deps);
      }
    });

    try {
      graph.sort(); // independent will be at the end
    } catch (err) { // catch cycling
      let infoLine = err.circular.map((id) => {
        let unitDef = this.unitDefStorage.get(id);
        return `\t{ ${id} = ${unitDef.units} }`;
      }).join('\n');
      let msg = 'Circular dependency in UnitDef: \n' + infoLine;
      this.logger.error(msg, {type: 'CircularError'});
    }

    return this;
  }

  /**
   * Checks circular ref in FunctionDef
   * 
   * @returns {Container} This function returns the container.
   */
  checkCircFunctionDef() {
    let graph = new TopoSort();
    this.functionDefStorage.forEach((functionDef) => {
      if (!functionDef.isCore) {
        let functionIds = functionDef.math
          .functionList()
          .map((x) => x.fn.name);
        functionIds.length > 0 && graph.add(functionDef.id, functionIds);
      }
    });

    try {
      graph.sort(); // independent will be at the end
    } catch (err) { // catch cycling
      let infoLine = err.circular.map((id) => {
        let functionDef = this.functionDefStorage.get(id);
        return `\t${id} = ${functionDef.math}`;
      }).join('\n');
      let msg = 'Circular dependency in functionDef: \n' + infoLine;
      this.logger.error(msg, {type: 'CircularError'});
    }

    return this;
  }

  /**
   * Compare left and right side of `Record`, `DSwitcher`, `CSwitcher`, `StopSwitcher`.
   * 
   * @returns {Container} This function returns the container.
   */
  checkUnits(){
    this.namespaceStorage.forEach((ns) => {
      if (!ns.isAbstract) {
        // check units for t
        let timeUnits = ns.get('t').unitsParsed;
        if (!timeUnits) {
          this.logger.warn('No units set for "t", cannot check ODE units.');
        }
        // check Record.assignments
        ns.selectByInstanceOf('Record')
          .forEach((rec) => rec.checkUnits());
        // check DSwitcher.trigger
        ns.selectByInstanceOf('DSwitcher')
          .forEach((rec) => rec.checkUnits());
        // check StopSwitcher.trigger
        ns.selectByInstanceOf('StopSwitcher')
          .forEach((rec) => rec.checkUnits());
        // check CSwitcher.trigger
        ns.selectByInstanceOf('CSwitcher')
          .forEach((rec) => rec.checkUnits());
      }
    });
    
    return this;
  }

  /**
   * check TimeScale, Compartment, Species, Reaction for correct terms.
   * 
   * @returns {Container} This function returns the container.
   */
  checkTerms(){
    this.namespaceStorage.forEach((ns) => {
      // check TimeScale from concrete namespace
      if (!ns.isAbstract) {
        ns.selectByInstanceOf('_Size')
          .filter((size) => { // check if units exists and legalTerms are set
            return size.unitsParsed !== undefined
              && size.legalTerms !== undefined
              && size.legalTerms.length !== 0;
          })
          .forEach((size) => {
            let term = size.unitsParsed.toTerm();
            // check if Term cannot be estimated
            if (typeof term === 'undefined') {
              let msg = `Unit term cannot be estimated for @${size.className} "${size.index}"`;
              this.logger.warn(msg, {type: 'UnitError'});
              return; // break
            }
            let isLegal = size.legalTerms.some((x) => term.equal(x)); // one of them is legal
            if (!isLegal) {
              let termString = term.toString();
              let legalTermStrings = size.legalTerms
                .map((term) => `"${term.toString()}"`)
                .join(', ');
              let msg = `@${size.className} "${size.index}" has wrong unit term. It must be ${legalTermStrings}, got "${termString}"`;
              this.logger.warn(msg, {type: 'UnitError'});
            }
          });
      }
    });
    
    return this;
  }

  /**
   * Checks circular dependencies in all instances of `Record`.
   * 
   * @returns {Container} This function returns the container.
   */
  checkCircRecord(){
    // knit components
    this.namespaceStorage
      .forEach((ns) => {
        if (!ns.isAbstract) {
          ns.checkCircRecord('start_', true);
          ns.checkCircRecord('ode_', true);
        }
      });

    return this;
  }
}

// only component classes are stored

module.exports = Container;
