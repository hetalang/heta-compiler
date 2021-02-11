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
const { SimpleTask } = require('../core/simple-task');
// external
const _ = require('lodash');
const { Namespace } = require('../namespace');
const { Logger, JSONTransport } = require('../logger');
const coreItems = require('./core-items.json');


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
    // storage of Namespace
    this.namespaceStorage = new Map();

    // default namespace
    let nameless = new Namespace('nameless');
    nameless.container = this;
    nameless._isAbstract = false;
    this.namespaceStorage.set('nameless', nameless);

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
    // knit unitDefs TODO: checking for circular UnitDef
    [...this.unitDefStorage].forEach((x) => x[1].bind());
    // knit components
    [...this.namespaceStorage].forEach((x) => {
      let ns = x[1];
      // knit only concrete namespace
      if (!ns.isAbstract) ns.knit();
    });

    return this;
  }
  // compare Compartment, Species, Reaction with correct terms
  checkTerms(){
    // TODO: not finished
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
  Const
};

module.exports = Container;
