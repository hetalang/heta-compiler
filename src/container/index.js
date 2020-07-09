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
const { UnitDef } = require('../core/unit-def');
const { Page } = require('../core/page');
const { Const } = require('../core/const');
const { SimpleTask } = require('../core/simple-task');
const _ = require('lodash');
const { Namespace } = require('../namespace');
const { Logger, JSONTransport } = require('../logger');

// they cannot be used as id, when 
const reservedWords = [
  'nameless',
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity',
  'e', 'E',
  'pi', 'PI'
];

class Container {
  constructor(){
    // logger
    this.logger = new Logger();
    this.defaultLogs = [];
    this.logger.addTransport(new JSONTransport('info', this.defaultLogs));

    this._namespaces = new Map();

    // default namespace
    let nameless = new Namespace('nameless');
    nameless.container = this;
    nameless._isAbstract = false;
    this._namespaces.set('nameless', nameless);

    // array to store _Export Instances
    this.exportStorage = [];
  }
  // returns array of errors in heta code
  hetaErrors(){
    return this.defaultLogs
      .filter(x => x.levelNum >= 3);
  }
  get namespaces(){
    return this._namespaces;
  }
  insert(q = {}, isCore = false){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    // check index
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)) {
      this.logger.error(`${ind} id should be string of type ID, but have "${q.id}"`, 'QueueError');
      return;
    }
    if (reservedWords.indexOf(q.id) !== -1) {
      this.logger.error(`${ind} id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`, 'QueueError');
      return;
    }
    if (!q.class || typeof q.class !== 'string'){
      this.logger.error(`${ind} No class or unsuitable class for "insert": ${q.class}`, 'QueueError');
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
    let selectedClass = this.classes[q.class];
    if (selectedClass === undefined){
      this.logger.error(`${ind} Unknown class "${q.class}" for the element.`, 'QueueError');
      return;
    }

    // get in namespace
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`${ind} create namespace "${space}" before use.`, 'QueueError');
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
      this.logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
      return;
    }
    if (q.class){
      this.logger.error(`${ind} Class property is not allowed for "update": ${q.class}`, 'QueueError');
      return;
    }
    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
      return;
    }

    let targetComponent = namespace.get(q.id);
    // creation of new components is not allowed
    if (targetComponent === undefined) {
      this.logger.error(`${ind} component does not exist which is not allowed for "update" strategy.`, 'QueueError');
      return;
    }
    if (targetComponent.isCore) {
      this.logger.error(`${ind} Core component is read-only and cannot be updated.`, 'QueueError');
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
      this.logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
      return;
    }
    if (q.class){
      this.logger.error(`${ind} Class property is not allowed for "delete": ${q.class}`, 'QueueError');
      return;
    }
    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
      return;
    }
    
    var targetComponent = namespace.get(q.id);
    if (!targetComponent) { // if targetComponent===false, element is not exist
      this.logger.error(`${ind} Element with id "${q.id}" does not exist and cannot be deleted.`, 'QueueError');
      return;
    }
    if(targetComponent.isCore){
      this.logger.error(`${ind} Core component is read-only and cannot be deleted.`, 'QueueError');
      return;
    }
    
    // normal flow
    return namespace.delete(q.id);
  }
  select(q = {}){
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
      this.logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
      return;
    }
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
      return;
    }
    
    // normal flow
    return namespace.get(q.id);
  }
  setNS(q = {}){
    // create namespace if not exists
    let namespace = this.namespaces.get(q.space);
    if (namespace === undefined){
      namespace = new Namespace(q.space);
      namespace.container = this; // set parent
      this._namespaces.set(q.space, namespace);
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
      this.logger.error(`fromId must not be set for #importNS, but have "${q.fromId}"`, 'QueueError');
      return;
    }
    if (q.id) {
      this.logger.error(`id must not be set for #importNS, but have "${q.id}"`);
      return;
    }
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`Create namespace "${space}" before use.`, 'QueueError');
      return;
    }
    
    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      this.logger.error(`space should be string, but have "${q.fromSpace}"`, 'QueueError');
      return;
    }
    
    let fromNamespace = this.namespaces.get(q.fromSpace);
    if (fromNamespace === undefined) {
      this.logger.error(`Create namespace "${q.fromSpace}" before use.`, 'QueueError');
      return;
    }

    // normal flow
    let clones = fromNamespace.toArray().map((component) => {
      // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
      let newId = _.get(
        q.rename, 
        component.id,
        [q.prefix, component.id, q.suffix].join('') // default value
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
      this.logger.error(`${ind} fromId should be string, but have "${q.fromId}"`, 'QueueError');
      return;
    }
    if (!q.id || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(q.id)){
      this.logger.error(`${ind} id should be string, but have "${q.id}"`, 'QueueError');
      return;
    }

    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`Create namespace "${space}" before use.`, 'QueueError');
      return;
    }

    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      this.logger.error(`fromSpace should be string, but have "${q.fromSpace}"`, 'QueueError');
      return;
    }

    let fromNamespace = this.namespaces.get(q.fromSpace);
    if (fromNamespace === undefined) {
      this.logger.error(`Create namespace "${q.fromSpace}" before use.`, 'QueueError');
      return;
    }
    
    // select component to copy
    let component = fromNamespace.get(q.fromId);
    if (!component) {
      this.logger.error(`Element with ${q.fromSpace}::${q.fromId} does not exist and cannot be imported.`, 'QueueError');
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
  export(q = {}){
    let space = q.space || 'nameless';

    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      this.logger.error(`#export action is reffered to namespace "${space}", which is not set.`, 'QueueError');
      return;
    }
    if (q.format === undefined) {
      this.logger.error('Empty format option in #export', 'QueueError');
      return;
    }
    if (typeof this.exports[q.format] !== 'function') {
      this.logger.error(`Unknown format "${q.format}" in #export action.`, 'QueueError');
      return;
    }

    // normal flow
    let exportInstance = new this.exports[q.format]();
    exportInstance.namespace = namespace;
    exportInstance.merge(q);
    // push to storage
    this.exportStorage.push(exportInstance);
    
    return exportInstance;
  }
  load(q, isCore = false){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    if (typeof this[actionName] !== 'function') {
      this.logger.error(`Action #${actionName} is unknown and will be skipped.`, 'QueueError');
      return;
    }
    
    // normal flow
    return this[actionName](q, isCore);
  }
  loadMany(qArr, isCore = false){
    qArr.forEach((q) => this.load(q, isCore));
    return this;
  }
  toArray(){
    return _.chain([...this.namespaces])
      .map((x) => x[1].toArray())
      .flatten()
      .value();
  }
  toQArr(removeCoreComponents = false, options = {}){
    let qArr = this.toArray()
      .filter((x) => !removeCoreComponents || !x.isCore)
      .map((x) => x.toQ(options));
    
    return qArr;
  }
  get length(){
    return _.sumBy([...this.namespaces], (x) => x[1].size);
  }
  // check all namespaces
  knitMany(){
    [...this.namespaces].forEach((x) => {
      let ns = x[1];
      // knit only concrete namespace
      if (!ns.isAbstract) ns.knit();
    });

    return this;
  }
}

Container.prototype.classes = {
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
  UnitDef,
  Page,
  Const
};

// storage of Export classes
Container.prototype.exports = {};

// converts {id: 'k1', space: 'one'} => 'one::k1'
function getIndexFromQ(q = {}){
  if (q.space !== undefined) {
    return `${q.space}::${q.id}`;
  } else {
    return q.id;
  }
}

module.exports = Container;
