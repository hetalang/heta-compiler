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

// they cannot be used as id, when 
const reservedWords = [
  'nameless',
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity',
  'e', 'E',
  'pi', 'PI'
];

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

    // load core items
    this.loadMany(coreItems, true);
  }
  // returns array of errors in heta code
  hetaErrors(){
    return this.defaultLogs
      .filter(x => x.levelNum >= 3);
  }
  insert(q = {}, isCore = false){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    // check index
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
      this.logger.error(
        `${ind} id should be string of type ID, but have "${q.id}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (reservedWords.indexOf(q.id) !== -1) {
      this.logger.error(
        `${ind} id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (!q.class || typeof q.class !== 'string'){
      this.logger.error(
        `${ind} No class or unsuitable class for "insert": ${q.class}`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // old style export
    let exportCheck = q.class.match(/^(\w+)Export$/);
    if (exportCheck !== null) { // check if old export syntax is used
      this.logger.warn(`Usage of Export is deprecated starting from v0.5.0, use syntax: #export {format: ${exportCheck[1]}, ...}`)
      let exportQ = _.omit(q, ['class', 'id']);
      _.defaults(exportQ, {
        format: exportCheck[1],
        filepath: q.id
      });
      return this.export(exportQ);
    }

    // check if class is in the list
    let selectedClass = this._componentClasses[q.class];
    if (selectedClass === undefined){
      this.logger.error(
        `"${ind}" Unknown class "${q.class}" for the component.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // get in namespace
    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `"${ind}" create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // normal flow
    let component = new selectedClass(isCore);
    component._id = q.id;
    component.namespace = namespace; // set parent space directly to component
    component.merge(q);
    namespace.set(q.id, component);
    return component;
  }
  update(q = {}){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
      this.logger.error(
        `${ind} Id should be string, but have "${q.id}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (q.class){
      this.logger.error(
        `${ind} Class property is not allowed for "update": ${q.class}`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    // set component
    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `${ind} Create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    let targetComponent = namespace.get(q.id);
    // creation of new components is not allowed
    if (targetComponent === undefined) {
      this.logger.error(
        `${ind} component does not exist which is not allowed for "update" strategy.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (targetComponent.isCore) {
      this.logger.error(
        `${ind} Core component is read-only and cannot be updated.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // normal flow
    targetComponent.merge(q);
    return targetComponent;
  }
  upsert(q = {}, isCore = false){
    if ('class' in q) {
      return this.insert(q, isCore);
    } else {
      return this.update(q);
    }
  }
  delete(q = {}){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
      this.logger.error(
        `${ind} Id should be string, but have "${q.id}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (q.class){
      this.logger.error(
        `${ind} Class property is not allowed for "delete": ${q.class}`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    // set component
    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `${ind} Create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    
    var targetComponent = namespace.get(q.id);
    if (!targetComponent) { // if targetComponent===false, element is not exist
      this.logger.error(
        `${ind} Element with id "${q.id}" does not exist and cannot be deleted.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if(targetComponent.isCore){
      this.logger.error(
        `${ind} Core component is read-only and cannot be deleted.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    
    // normal flow
    return namespace.delete(q.id);
  }
  select(q = {}){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
      this.logger.error(
        `${ind} Id should be string, but have "${q.id}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `${ind} Create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    
    // normal flow
    return namespace.get(q.id);
  }
  setNS(q = {}){
    // create namespace if not exists
    let namespace = this.namespaceStorage.get(q.space);
    if (namespace === undefined){
      namespace = new Namespace(q.space);
      namespace.container = this; // set parent
      this.namespaceStorage.set(q.space, namespace);
    }
    // it is possible to update type
    namespace._isAbstract = q.type === 'abstract';
    let typeString = namespace._isAbstract ? 'abstract' : 'concrete';
    this.logger.info(`Namespace "${q.space}" was set as "${typeString}"`);
  }
  /* 
    clone all components to another space
    #importNS two::* {
      fromSpace: one,
      prefix: '',
      suffix: '',
      rename: {}
    };
  */
  importNS(q = {}){
    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let space = q.space || 'nameless';
    if (q.fromId) {
      this.logger.error(
        `fromId must not be set for #importNS, but have "${q.fromId}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (q.id) {
      this.logger.error(`id must not be set for #importNS, but have "${q.id}"`);
      return;
    }
    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `Create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      this.logger.error(
        `space should be string, but have "${q.fromSpace}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    let fromNamespace = this.namespaceStorage.get(q.fromSpace);
    if (fromNamespace === undefined) {
      this.logger.error(
        `Create namespace "${q.fromSpace}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // normal flow
    let clones = fromNamespace.toArray().map((component) => {
      // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
      let newId = _.get(
        q.rename, 
        component.id,
        [q.prefix, component.id, q.suffix].join('') // pref-id-suff as default value
      );

      // cloning and update references
      let clone = component.clone();
      clone._id = newId;
      clone.namespace = namespace;
      clone.updateReferences(q);

      namespace.set(newId, clone);

      return clone;
    });

    return clones;
  }
  /*
    the same as importNS but delete all elements from source namespace
  */
  /*
  moveNS(q = {}){
    let toClone = this.storage.selectBySpace(q.fromSpace);
    let clones = this.importNS(q);

    toClone.forEach((component) => {
      this.storage.delete(component.index);
    });

    return clones;
  }
  */
  /* 
    clones element updating id, space and referencies
    #import two::k2 {
      fromId: k1
      fromSpace: one,
      // from: one::k1
      prefix: '',
      suffix: '',
      rename: {}
    };
  */
  import(q = {}){
    let ind = getIndexFromQ(q);

    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let space = q.space || 'nameless';
    // checking arguments
    if (!q.fromId || (typeof q.fromId !== 'string')) {
      this.logger.error(
        `${ind} fromId should be string, but have "${q.fromId}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
      this.logger.error(
        `${ind} id should be string, but have "${q.id}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    let namespace = this.namespaceStorage.get(space);
    if (namespace === undefined) {
      this.logger.error(
        `Create namespace "${space}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      this.logger.error(
        `fromSpace should be string, but have "${q.fromSpace}"`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    let fromNamespace = this.namespaceStorage.get(q.fromSpace);
    if (fromNamespace === undefined) {
      this.logger.error(
        `Create namespace "${q.fromSpace}" before use.`,
        {type: 'QueueError', space: space}
      );
      return;
    }
    
    // select component to copy
    let component = fromNamespace.get(q.fromId);
    if (!component) {
      this.logger.error(
        `Element with ${q.fromSpace}::${q.fromId} does not exist and cannot be imported.`,
        {type: 'QueueError', space: space}
      );
      return;
    }

    // normal flow
    let clone = component.clone();
    clone._id = q.id;
    clone.namespace = namespace;
    clone.updateReferences(q);
    namespace.set(q.id, clone);

    return clone;
  }

  /*
   the same as import but delete source component
  
  move(q = {}){
    let clone = this.import(q);

    // delete component
    this.delete({id: q.fromId, space: q.fromSpace});

    return clone;
  }
  */
  // === ACTIONS ===
  // #export
  export(q = {}, isCore = false){
    if (q.format === undefined) {
      this.logger.error(
        'Empty "format" option in #export',
        {type: 'QueueError'}
      );
      return;
    }
    if (typeof this.classes[q.format] !== 'function') {
      this.logger.error(
        `Unknown format "${q.format}" in #export action.`,
        {type: 'QueueError'}
      );
      return;
    }

    // create and push to storage
    let exportInstance = new this.classes[q.format](q, isCore);
    this.exportStorage.set(exportInstance.id, exportInstance);
    
    return exportInstance;
  }
  // #defineUnit
  defineUnit(q = {}, isCore = false){
    // normal flow
    let unitDefInstance = new this.classes.UnitDef(q, isCore);
    if (unitDefInstance.id) { // actually id is always presented
      this.unitDefStorage.set(unitDefInstance.id, unitDefInstance);
    }

    return unitDefInstance;
  }
  // === OTHER ===
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

// converts {id: 'k1', space: 'one'} => 'one::k1'
function getIndexFromQ(q = {}){
  if (q.space !== undefined) {
    return `${q.space}::${q.id}`;
  } else {
    return q.id;
  }
}

module.exports = Container;
