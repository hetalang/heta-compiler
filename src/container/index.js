const { Component } = require('../core/component');
const { Record } = require('../core/record');
const { Compartment } = require('../core/compartment');
const { Species } = require('../core/species');
const { Reaction } = require('../core/reaction');
const { Process } = require('../core/process');
const { CondSwitcher } = require('../core/cond-switcher');
const { TimeSwitcher } = require('../core/time-switcher');
const { ReferenceDefinition } = require('../core/reference-definition');
const { UnitDef } = require('../core/unit-def');
const { Page } = require('../core/page');
const { Const } = require('../core/const');
const { SimpleTask } = require('../core/simple-task');
const _ = require('lodash');
const { Namespace } = require('../namespace');
const Logger = require('../logger');

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
    this.logger = new Logger();
    this._namespaces = new Map();
    // default namespace
    let nameless = new Namespace('nameless');
    nameless._isAbstract = false;
    this._namespaces.set('nameless', nameless);
    // array to store _Export Instances
    this.exportStorage = [];
  }
  get namespaces(){
    return this._namespaces;
  }
  insert(q = {}, isCore = false){
    let logger = new Logger();
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    // check index
    if(!q.id || (typeof q.id !== 'string'))
      logger.error(`${ind} id should be string, but have "${q.id}"`, 'QueueError');
    if(reservedWords.indexOf(q.id)!==-1)
      logger.error(`${ind} id cannot be one of reserved word, but have "${q.id}". reservedWords = [${reservedWords}]`, 'QueueError');
    if(!q.class || typeof q.class !== 'string')
      logger.error(`${ind} No class or unsuitable class for "insert": ${q.class}`, 'QueueError');
    
    // STOP
    if (logger.hasErrors) {
      this.logger.pushMany(logger);
      return;
    }
    
    let exportCheck = q.class.match(/^(\w+)Export$/);
    if (exportCheck !== null) { // check if old export syntax is used
      logger.warn(`Usage of Export is depricated starting from v0.5.0, use syntax: #export {format: ${exportCheck[1]}, ...}`)
      this.logger.pushMany(logger);
      let exportQ = _.omit(q, ['class', 'id']);
      _.defaults(exportQ, {
        format: exportCheck[1],
        filepath: q.id
      });
      return this.export(exportQ);
    }

    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass === undefined)
      logger.error(`${ind} Unknown class "${q.class}" for the element.`, 'QueueError');
    
    // get in namespace
    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      logger.error(`${ind} create namespace "${space}" before use.`, 'QueueError');

    this.logger.pushMany(logger);
    if (!logger.hasErrors) {
      let component = (new selectedClass(isCore)).merge(q);
      this.logger.pushMany(component.logger);
      component._id = q.id;
      component.namespace = namespace; // set parent space directly to component
      namespace.set(q.id, component);
      return component;
    } else {
      this.logger.warn(`${ind} will be skipped from queue.`);
      return;
    }
  }
  update(q = {}){
    let logger = new Logger();
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || (typeof q.id !== 'string'))
      logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
    if (q.class)
      logger.error(`${ind} Class property is not allowed for "update": ${q.class}`, 'QueueError');

    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
    } else {
      var targetComponent = namespace.get(q.id);
        
      // creation of new components is not allowed
      if (targetComponent === undefined)
        logger.error(`${ind} component does not exist which is not allowed for "update" strategy.`, 'QueueError');
      else if (targetComponent.isCore)
        logger.error(`${ind} Core component is read-only and cannot be updated.`, 'QueueError');
    }

    this.logger.pushMany(logger);
    if (!logger.hasErrors) {
      targetComponent.merge(q);
      this.logger.pushMany(targetComponent.logger);
      return targetComponent;
    } else {
      this.logger.warn(`${ind} will not be updated.`);
      return;
    }
  }
  upsert(q = {}, isCore = false){
    if('class' in q){
      return this.insert(q, isCore);
    }else{
      return this.update(q);
    }
  }
  delete(q = {}){
    let logger = new Logger();
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if(!q.id || (typeof q.id !== 'string'))
      logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
    if(q.class)
      logger.error(`${ind} Class property is not allowed for "delete": ${q.class}`, 'QueueError');

    // set component
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
    } else {
      var targetComponent = namespace.get(q.id);
      if (!targetComponent) // if targetComponent===false, element is not exist
        logger.error(`${ind} Element with id "${q.id}" does not exist and cannot be deleted.`, 'QueueError');
      else if(targetComponent.isCore)
        logger.error(`${ind} Core component is read-only and cannot be deleted.`, 'QueueError');
    }
    
    this.logger.pushMany(logger);
    if (!logger.hasErrors) {
      return namespace.delete(q.id);
    } else {
      this.logger.warn(`${ind} will not be deleted.`);
      return false;
    }
  }
  select(q = {}){
    let logger = new Logger();
    let ind = getIndexFromQ(q);

    let space = q.space || 'nameless';
    if (!q.id || (typeof q.id !== 'string'))
      logger.error(`${ind} Id should be string, but have "${q.id}"`, 'QueueError');
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      logger.error(`${ind} Create namespace "${space}" before use.`, 'QueueError');
    } else {
      var targetComponent = namespace.get(q.id);
    }
    this.logger.pushMany(logger);

    return targetComponent;
  }
  setNS(q = {}){
    // create namespace if not exists
    let namespace = this.namespaces.get(q.space);
    if (namespace === undefined){
      namespace = new Namespace(q.space);
      this._namespaces.set(q.space, namespace);
    }
    // it is possible to update type
    namespace._isAbstract = q.type === 'abstract';
    let typeString = namespace._isAbstract ? 'abstaract' : 'concrete'
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
    let logger = new Logger();
    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let space = q.space || 'nameless';
    if(q.fromId)
      logger.error(`fromId must not be set for #importNS, but have "${q.fromId}"`, 'QueueError');
    if(q.id)
      logger.error(`id must not be set for #importNS, but have "${q.id}"`);

    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      logger.error(`Create namespace "${space}" before use.`, 'QueueError');
    }
    
    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      logger.error(`space should be string, but have "${q.fromSpace}"`, 'QueueError');
    } else {
      var fromNamespace = this.namespaces.get(q.fromSpace);
      if (fromNamespace === undefined) {
        logger.error(`Create namespace "${q.fromSpace}" before use.`, 'QueueError');
      }
    }

    this.logger.pushMany(logger);
    if (!logger.hasErrors) {
      let clones = fromNamespace.toArray().map((component) => {
        // update id: q.id is ignored, q.rename[component.id], [q.suffix, component.id, q.prefix].join('')
        let newId = _.get(
          q.rename, 
          component.id,
          [q.prefix, component.id, q.suffix].join('') // default value
        );
  
        // cloning and update references
        let clone = component.clone({id: newId, space: q.space});
        clone.namespace = namespace;
        clone.updateReferences(q);
  
        namespace.set(newId, clone);
  
        return clone;
      });

      return clones;
    } else {
      this.logger.warn(`namespace "${q.fromSpace}" was not imported to "${space}"`);
      return [];
    }
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
    let logger = new Logger();
    let ind = getIndexFromQ(q);

    _.defaults(q, {
      prefix: '',
      suffix: '',
      rename: {}
    });

    let space = q.space || 'nameless';
    // checking arguments
    if(!q.fromId || (typeof q.fromId !== 'string'))
      logger.error(`${ind} fromId should be string, but have "${q.fromId}"`, 'QueueError');
    if (!q.id || (typeof q.id !== 'string'))
      logger.error(`${ind} id should be string, but have "${q.id}"`, 'QueueError');
      
    let namespace = this.namespaces.get(space);
    if (namespace === undefined) {
      logger.error(`Create namespace "${space}" before use.`, 'QueueError');
    }

    if (!q.fromSpace || (typeof q.fromSpace !== 'string')) {
      logger.error(`fromSpace should be string, but have "${q.fromSpace}"`, 'QueueError');
    } else {
      var fromNamespace = this.namespaces.get(q.fromSpace);
      if (fromNamespace === undefined) {
        logger.error(`Create namespace "${q.fromSpace}" before use.`, 'QueueError');
      } else {
        // select component to copy
        var component = fromNamespace.get(q.fromId);
        if(!component)
          logger.error(`Element with ${q.fromSpace}::${q.fromId} does not exist and cannot be imported.`, 'QueueError');
      }
    }
    
    this.logger.pushMany(logger);
    if (!logger.hasErrors) {
      // cloning and update references
      let clone = component.clone({id: q.id});
      clone.namespace = namespace;
      clone.updateReferences(q);

      namespace.set(q.id, clone);

      return clone;
    } else {
      this.logger.warn(`Element ${ind} was not created.`);
      return;
    }
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
    let logger = new Logger();
    let space = q.space || 'nameless';

    let namespace = this.namespaces.get(space);
    if (namespace === undefined)
      logger.error(`#export action is reffered to namespace "${space}", which is not set.`, 'QueueError');

    if (q.format === undefined) {
      logger.error('Empty format option in #export', 'QueueError');
    } else if (typeof this.exports[q.format] !== 'function') {
      logger.error(`Unknown format "${q.format}" in #export action.`, 'QueueError');
    }

    if (!logger.hasErrors) {
      // create export instance
      let exportInstance = new this.exports[q.format]();
      exportInstance.merge(q);
      exportInstance.namespace = namespace;
      logger.pushMany(exportInstance.logger);
      // push to storage
      this.exportStorage.push(exportInstance);
      
      return exportInstance;
    } else {
      return;
    }

    this.logger.pushMany(logger);

    
  }
  load(q, isCore = false){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    if (typeof this[actionName] !== 'function') {
      this.logger.error(`Action #${actionName} is unknown and will be skipped.`, 'QueueError');
    } else {
      return this[actionName](q, isCore);
    }
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
      this.logger.pushMany(ns.logger);
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
  CondSwitcher,
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
  if(q.space!==undefined){
    return `${q.space}::${q.id}`;
  }else{
    return q.id;
  }
}

module.exports = Container;
