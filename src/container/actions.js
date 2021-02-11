const Container = require('./main');
const { Namespace } = require('../namespace');
const _ = require('lodash');

// they cannot be used as id, when 
const reservedWords = [
  'nameless',
  'include', 'block', 'namespace', 'abstract', 'concrete', 'begin', 'end',
  'NaN', 'Infinity',
  'e', 'E',
  'pi', 'PI'
];

// #export
Container.prototype.export = function(q = {}, isCore = false){
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
  if (!exportInstance.errored) this.exportStorage.set(exportInstance.id, exportInstance);
  
  return exportInstance;
};

// #defineUnit
Container.prototype.defineUnit = function(q = {}, isCore = false){
  // normal flow
  let unitDefInstance = new this.classes.UnitDef(q, isCore);
  if (!unitDefInstance.errored) this.unitDefStorage.set(unitDefInstance.id, unitDefInstance);

  return unitDefInstance;
};

// #insert
Container.prototype.insert = function(q = {}, isCore = false){
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
};

// #update
Container.prototype.update = function(q = {}){
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
};

// #upsert
Container.prototype.upsert = function(q = {}, isCore = false){
  if ('class' in q) {
    return this.insert(q, isCore);
  } else {
    return this.update(q);
  }
};

// #delete
Container.prototype.delete = function(q = {}){
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
};

// #setNS
Container.prototype.setNS = function(q = {}){
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
};

// #importNS
/* 
  clone all components to another space
  #importNS two::* {
    fromSpace: one,
    prefix: '',
    suffix: '',
    rename: {}
  };
*/
Container.prototype.importNS = function(q = {}){
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
};

// #moveNS
/*
  the same as importNS but delete all elements from source namespace
Container.prototype.moveNS = function(q = {}){
  let toClone = this.storage.selectBySpace(q.fromSpace);
  let clones = this.importNS(q);

  toClone.forEach((component) => {
    this.storage.delete(component.index);
  });

  return clones;
};
*/

// #import
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
Container.prototype.import = function(q = {}){
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
};

// #move
/*
  the same as import but delete source component

Container.prototype.move = function(q = {}){
  let clone = this.import(q);

  // delete component
  this.delete({id: q.fromId, space: q.fromSpace});

  return clone;
}
*/

// #select
// XXX: don't really used
Container.prototype.select = function(q = {}){
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
};

// converts {id: 'k1', space: 'one'} => 'one::k1'
function getIndexFromQ(q = {}){
  if (q.space !== undefined) {
    return `${q.space}::${q.id}`;
  } else {
    return q.id;
  }
}
