const { Quantity } = require('./core/quantity');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Model } = require('./core/model');
const { Storage } = require('./storage');
const { Process } = require('./core/process');
const { Event } = require('./core/event');
const { ReferenceDefinition } = require('./core/reference-definition');
const { UnitDefinition } = require('./core/reference-definition');
const { Page } = require('./core/page');
// const { validator } = require('./core/utilities.js');
const _ = require('lodash');
const expect = require('chai').expect;

class Container {
  constructor(){
    this.storage = new Storage();
    this.classes = {
      // scoped classes
      Quantity,
      Compartment,
      Species,
      Process,
      Reaction,
      Event,
      // unscoped classes
      Model,
      ReferenceDefinition,
      UnitDefinition,
      Page
    };
  }
  select(index){ // db-mode
    return this.storage.get(index);
  }
  insert(q){
    // check if class is presented
    expect(q).has.property('class').with.a('string');
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
    expect(q).not.to.have.property('class');
    expect(q).to.have.property('id').with.a('string');
    let index = q.space ? q.space : 'default__'
      + '.' + q.id;
    let targetComponent = this.storage.get(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new Error(
        `Element with index: "${index}" is not exist which is not allowed for "update" strategy.`
      );

    let simple = targetComponent.merge(q);

    return simple;
  }
  import(q){
    // estimate action, default is upsert
    let actionName = _.get(q, 'action', 'insert');
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
