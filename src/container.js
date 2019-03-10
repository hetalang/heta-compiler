const { Quantity } = require('./core/quantity');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Model } = require('./core/model');
const { Storage } = require('./storage');
const { Process } = require('./core/process');
const { Event } = require('./core/event');
const { ReferenceDefinition } = require('./core/reference-definition');
const { Page } = require('./core/page');
// const { validator } = require('./core/utilities.js');
const _ = require('lodash');
// const should = require('should');

class Container {
  constructor(){
    this.storage = new Storage();
    this.classes = {
      Quantity,
      Compartment,
      Species,
      Process,
      Reaction,
      Model,
      Event,
      ReferenceDefinition,
      Page
    };
  }
  select(index){ // db-mode
    return this.storage.get(index);
  }
  insert(q){
    // check if class is presented
    q.should.has.property('class').with.ok();
    // check if class is in the list
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new Error(
        `Unknown "class" ${q.class} for component id: "${q.id}".`
      );
    let simple = (new selectedClass({id: q.id, space: q.space})).merge(q, false);

    this.storage.set(simple);

    return this;
  }
  update(q){
    let hasClass = 'class' in q;
    let index = {id: q.id, space: q.space};
    let targetComponent = this.select(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
      throw new Error(
        `Element with index: "${index}" is not exist which is not allowed for "update" strategy.`
      );
    // class cannot be changed
    if(hasClass && targetComponent && q.class !== targetComponent.className)
      throw new Error(
        `Component "${index}" truing to change class which is not allowed in current version.`
      );

    targetComponent.merge(q, false);

    return this;
  }
  import(q){
    // estimate action
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

module.exports = {
  Container
};
