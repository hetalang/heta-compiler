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
    this.unitDefStorage.forEach((ns) => ns.bind());
    // knit components
    this.namespaceStorage.forEach((ns) => {
      // knit only concrete namespace
      if (!ns.isAbstract) ns.knit();
    });

    return this;
  }
  // check left and right part of record
  // TODO: not finished yet
  checkUnits(){
    this.namespaceStorage.forEach((value) => {
      if (!value.isAbstract) {
        value.selectByInstanceOf('Record')
          .filter((rec) => typeof rec.unitsParsed !== 'undefined')
          .forEach((rec) => {
            let leftSideUnit = rec.unitsParsed;
            for (const scope in rec.assignments) {
              let rightSideExpr = rec.assignments[scope];
              if (typeof rightSideExpr.num === 'undefined') {
                //let rightSideUnit = rightSideExpr.calcUnit();
                //let isEqual = leftSideUnit.equal(rightSideUnit);
                //console.log(rightSideUnit);
              }
            }
          });
      }
    });
  }
  // compare Compartment, Species, Reaction with correct terms
  checkTerms(){
    this.namespaceStorage.forEach((value) => {
      // check Compartment from concrete namespace
      value.isAbstract || value.selectByClassName('Compartment')
        .filter((rec) => typeof rec.unitsParsed !== 'undefined')
        .forEach((rec) => {
          let term = rec.unitsParsed.toTerm();
          // check if Term cannot be estimated
          if (typeof term === 'undefined') {
            let msg = `Unit term cannot be estimated for Compartment "${rec.index}"`;
            this.logger.warn(msg, {type: 'UnitError'});
            return; // break
          }
          let isLegal = Compartment.legalTerms.some((x) => term.equal(x)); // one of them is legal
          if (!isLegal) {
            let msg = `Compartment "${rec.index}" has wrong unit term. It must be "length", "square" or "volume".`;
            this.logger.warn(msg, {type: 'UnitError'});
          }
        });
      
      // check Species from concrete namespace
      value.isAbstract || value.selectByClassName('Species')
        .filter((rec) => typeof rec.unitsParsed !== 'undefined')
        .forEach((rec) => {
          let term = rec.unitsParsed.toTerm();
          // check if Term cannot be estimated
          if (typeof term === 'undefined') {
            let msg = `Unit term cannot be estimated for Species "${rec.index}"`;
            this.logger.warn(msg, {type: 'UnitError'});
            return; // break
          }
          if (rec.isAmount){
            let isLegal = Species.legalTermsAmount.some((x) => term.equal(x)); // one of them is legal
            if (!isLegal) {
              let msg = `Species {isAmount: true} "${rec.index}" has wrong unit term. It must be "amount"`;
              this.logger.warn(msg, {type: 'UnitError'});
            }
          } else {
            let isLegal = Species.legalTerms.some((x) => term.equal(x)); // one of them is legal
            if (!isLegal) {
              let msg = `Species {isAmount: false} "${rec.index}" has wrong unit term. It must be "amount/length", "amount/square" or "amount/volume"`;
              this.logger.warn(msg, {type: 'UnitError'});
            }
          }
        });

      // check Reaction from concrete namespace
      value.isAbstract || value.selectByClassName('Reaction')
        .filter((rec) => typeof rec.unitsParsed !== 'undefined')
        .forEach((rec) => {
          let term = rec.unitsParsed.toTerm();
          // check if Term cannot be estimated
          if (typeof term === 'undefined') {
            let msg = `Unit term cannot be estimated for Reaction "${rec.index}"`;
            this.logger.warn(msg, {type: 'UnitError'});
            return; // break
          }
          let isLegal = Reaction.legalTerms.some((x) => term.equal(x)); // one of them is legal
          if (!isLegal) {
            let msg = `Reaction "${rec.index}" has wrong unit term. It must be "amount/time", "mass/time"`;
            this.logger.warn(msg, {type: 'UnitError'});
          }
        });
    });
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
