const { IndexValidationError } = require('./validation-error');
const { Record } = require('./core/record');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Model } = require('./core/model');
const { Storage } = require('./storage');
const { Process } = require('./core/process');
const { Switcher } = require('./core/switcher');
const { ReferenceDefinition } = require('./core/reference-definition');
const { UnitDefinition } = require('./core/reference-definition');
const { Page } = require('./core/page');
const { Const } = require('./core/const');
// const { validator } = require('./core/utilities.js');
const _ = require('lodash');
const expect = require('chai').expect;

class Container {
  constructor(){
    this.storage = new Storage();
    this.classes = {
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
      Const
    };
  }
  insert(q){
    // check
    if(!q)
      throw new IndexValidationError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexValidationError({id: q.id});
    expect(q).to.have.property('class').with.a('string');
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new Error(
        `Unknown "class" ${q.class} for component id: "${q.id}".`
      );
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q);

    this.storage.setByIndex(simple);

    return simple;
  }
  update(q){
    if(!q)
      throw new IndexValidationError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexValidationError({id: q.id});
    expect(q).not.to.have.property('class');
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
      throw new IndexValidationError(q);
    if(!q.id || (typeof q.id !== 'string'))
      throw new IndexValidationError({id: q.id});
    expect(q).not.to.have.property('class');
    let index = q.space ? (q.space + '.' + q.id) : q.id;
    let targetComponent = this.storage.delete(index);

    return targetComponent;
  }
  import(q){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'upsert');
    // do action
    return this[actionName](q);
  }
  importMany(qArr){
    qArr.forEach((q) => this.import(q));
    return this;
  }
  toQArr(){
    let qArr = this.storage.map((obj) => obj.toQ());
    return qArr;
  }
  toJSON(){
    return JSON.stringify(this.toQArr(), null, 2);
  }
}

module.exports = Container;
