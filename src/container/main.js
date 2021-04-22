// Top classes
const { Top } = require('../core/top');
const { UnitDef } = require('../core/unit-def');
// const { AbstractExport } = require('../core/abstract-export');
// Component classes
const { Component } = require('../core/component');
const { Record } = require('../core/record');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const { Process } = require('../core/process');
const { DSwitcher } = require('../core/d-switcher');
const { CSwitcher } = require('../core/c-switcher');
const { TimeSwitcher } = require('../core/time-switcher');
const { ReferenceDefinition } = require('../core/reference-definition');
const { Page } = require('../core/page');
const { Const } = require('../core/const');
const { TimeScale } = require('../core/time-scale');
const { SimpleTask } = require('../core/simple-task');
// external
const _ = require('lodash');
const { Namespace } = require('../namespace');
const { Logger, JSONTransport } = require('../logger');
const coreItems = require('./core-items.json');
const TopoSort = require('@insysbio/topo-sort');


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
    // create "export" classes bound to this container
    _.forEach(Container._exportClasses, (_Class, key) => {
      this.classes[key] = class extends _Class {};
      this.classes[key].prototype._container = this;
    });
    
    // logger
    this.logger = new Logger();
    this.defaultLogs = []; // storing logs in JSON-like format here
    this.logger.addTransport(new JSONTransport('info', this.defaultLogs));

    // storage of AbstractExport Instances
    this.exportStorage = new Map();
    // storage for UnitDef
    this.unitDefStorage = new Map();
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
  // returns array of errors in heta code
  hetaErrors(){
    return this.defaultLogs
      .filter(x => x.levelNum >= 3);
  }
  load(q, isCore = false){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    if (typeof this[actionName] !== 'function') {
      this.logger.error(
        `Action #${actionName} is unknown and will be skipped.`,
        {type: 'QueueError', action: actionName}
      );
      return;
    }
    // normal flow
    return this[actionName](q, isCore);
  }
  loadMany(qArr, isCore = false){
    qArr.forEach((q) => this.load(q, isCore));
    return this;
  }
  get length(){
    return _.sumBy([...this.namespaceStorage], (x) => x[1].size)
      + this.unitDefStorage.size // global element
      + this.exportStorage.size; // global element
  }
  // check all namespaces
  knitMany(){
    // knit unitDef
    this.unitDefStorage.forEach((ns) => ns.bind());
    // knit components
    this.namespaceStorage.forEach((ns) => {
      // knit only concrete namespace
      if (!ns.isAbstract) ns.knit();
    });

    return this;
  }
  // check circular ref in UnitDef
  checkCircUnitDef(){
    // the same method as for sortExpressionsByContext()
    let graph = new TopoSort();
    this.unitDefStorage.forEach((unitDef) => {
      if (typeof unitDef.unitsParsed !== 'undefined') {
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
  }
  // check left and right part of record
  checkUnits(){
    this.namespaceStorage.forEach((value) => {
      if (!value.isAbstract) {
        // check Record.assignments
        value.selectByInstanceOf('Record')
          .forEach((rec) => rec.checkUnits());
        // check DSwitcher.trigger
        value.selectByInstanceOf('DSwitcher')
          .forEach((rec) => rec.checkUnits());
        // check CSwitcher.trigger
        value.selectByInstanceOf('CSwitcher')
          .forEach((rec) => rec.checkUnits());
      }
    });
  }
  // compare TimeScale, Compartment, Species, Reaction with correct terms
  checkTerms(){
    this.namespaceStorage.forEach((value) => {
      // check TimeScale from concrete namespace
      value.isAbstract || value.selectByInstanceOf('_Size')
        .filter((size) => { // check if units exists and legalTerms are set
          return size.unitsParsed !== undefined
            && size.legalTerms !== undefined
            && size.legalTerms.length !== 0;
        })
        .forEach((size) => {
          let constructorName = size.constructor.name;
          let term = size.unitsParsed.toTerm();
          // check if Term cannot be estimated
          if (typeof term === 'undefined') {
            let msg = `Unit term cannot be estimated for @${constructorName} "${size.index}"`;
            this.logger.warn(msg, {type: 'UnitError'});
            return; // break
          }
          let isLegal = size.legalTerms.some((x) => term.equal(x)); // one of them is legal
          if (!isLegal) {
            let termString = term.toString();
            let legalTermStrings = size.legalTerms
              .map((term) => `"${term.toString()}"`)
              .join(', ');
            let msg = `@${constructorName} "${size.index}" has wrong unit term. It must be ${legalTermStrings}, got "${termString}"`;
            this.logger.warn(msg, {type: 'UnitError'});
          }
        });
    });
  }
  // check circular dependencies in Records
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
Container.prototype._componentClasses = {
  Component,
  Record,
  Compartment,
  Species,
  Process,
  Reaction,
  DSwitcher,
  CSwitcher,
  TimeSwitcher,
  SimpleTask,
  ReferenceDefinition,
  Page,
  Const,
  TimeScale
};

module.exports = Container;
