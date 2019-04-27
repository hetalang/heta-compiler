const { IndexedHetaError } = require('./heta-error');
const { Record } = require('./core/record');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Model } = require('./core/model');
const { Process } = require('./core/process');
const { Switcher } = require('./core/switcher');
const { ReferenceDefinition } = require('./core/reference-definition');
const { UnitDefinition } = require('./core/reference-definition');
const { Page } = require('./core/page');
const { Const } = require('./core/const');
const _ = require('lodash');
const { _Export, JSONExport } = require('./core/_export');
const { getIndexFromQ } = require('./common');

class Container {
  constructor(){
    this.storage = new Map();
  }
  insert(q){
    // check
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, JSON.stringify({id: q.id}));
    if(!q.class || typeof q.class !== 'string')
      throw new IndexedHetaError(q, `No class or unsuitable class for "insert": ${q.class}`);
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new IndexedHetaError(q, `Unknown class "${q.class}" for the element.`);
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q);

    this.storage.set(simple.index, simple);
    let shouldIncludeStorage =
      (simple instanceof Model)
      || (simple instanceof _Export);
    if(shouldIncludeStorage) {
      simple._storage = this.storage;
    }

    return simple;
  }
  update(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, JSON.stringify({id: q.id}));
    if(q.class)
      throw new IndexedHetaError(q, `Class property is not allowed for "update": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.get(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new IndexedHetaError(q, 'Element with the index is not exist which is not allowed for "update" strategy.');

    targetComponent.merge(q);

    return targetComponent;
  }
  upsert(q){
    if('class' in q){
      return this.insert(q);
    }else{
      return this.update(q);
    }
  }
  delete(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, JSON.stringify({id: q.id}));
    if(q.class)
      throw new IndexedHetaError(q, `Class property is not allowed for "delete": ${q.class}`);
    let index = getIndexFromQ(q);
    let targetComponent = this.storage.delete(index);
    if(!targetComponent) // if targetComponent===false, element is not exist
      throw new IndexedHetaError(q, 'Element with index is not exist and cannot be deleted.');

    return targetComponent; // true or false
  }
  select(q){
    if(!q)
      throw new IndexedHetaError(q, JSON.stringify(q));
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexedHetaError(q, `Id should be string, but have "${q.id}"`);
    let index = getIndexFromQ(q);
    return this.storage.get(index);
  }
  load(q){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    // do action
    return this[actionName](q);
  }
  loadMany(qArr){
    qArr.forEach((q) => this.load(q));
    return this;
  }
  toQArr(useVirtual){
    let qArr = [...this.storage]
      .filter((obj) => !obj.virtual || useVirtual)
      .map((obj) => obj[1].toQ());
    return qArr;
  }
  toJSON(){
    return JSON.stringify(this.toQArr(), null, 2);
  }
  get length(){
    return this.storage.size;
  }
}

Container.prototype.classes = {
  // scoped classes
  Record,
  Compartment,
  Species,
  Process,
  Reaction,
  Switcher,
  // unscoped classes
  Model,
  ReferenceDefinition,
  UnitDefinition,
  Page,
  Const,
  JSONExport
};

module.exports = Container;
