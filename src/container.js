const { ActionError } = require('./validation-error');
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

class Container {
  constructor(){
    this.storage = new Map();
  }
  insert(q){
    // check
    if(!q)
      throw new ActionError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new ActionError({id: q.id});
    if(!q.class || typeof q.class !== 'string')
      throw new TypeError(`No class or unsuitable class for "insert": ${q.class}`);
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new TypeError(
        `Unknown "class" ${q.class} for component id: "${q.id}".`
      );
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q);

    // this.storage.setByIndex(simple);
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
      throw new ActionError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new ActionError({id: q.id});
    if(q.class)
      throw new TypeError(`Class property is not allowed for "update": ${q.class}`);
    let index = q.space ? (q.space + '.' + q.id) : q.id;
    let targetComponent = this.storage.get(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new Error(
        `Element with index: "${index}" is not exist which is not allowed for "update" strategy.`
      );

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
      throw new ActionError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new ActionError({id: q.id});
    if(q.class)
      throw new TypeError(`Class property is not allowed for "delete": ${q.class}`);
    let index = q.space ? (q.space + '.' + q.id) : q.id;
    let targetComponent = this.storage.delete(index);
    if(!targetComponent) // if targetComponent===false, element is not exist
      throw new Error(`Element with index "${index}" is not exist and cannot be deleted.`);

    return targetComponent; // true or false
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
  // get different code of different formats
  // TODO: implement format selection
  toCode(format, model){
    let modelObject = this.storage.get(model); // TODO: implement get to use this.get({id: model})
    if(modelObject===undefined){
      throw new Error(`Required model "${model}" is not found in container and will not be exported to ${format}.`);
    }
    switch(format){
      case 'sbml':
        return modelObject.toSBML();
        break;
      default:
        throw new Error(`Unknown format ${format} to export.`);
    }
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
