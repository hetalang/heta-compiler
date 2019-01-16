const { Quantity } = require('./core/quantity');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Scene } = require('./core/scene');
const _ = require('lodash');

class Container {
  constructor(){
    this._storage = [];
    this.classes = {
      Quantity,
      Compartment,
      Species,
      Reaction,
      Scene
    };
  }
  insert(simple, id, space='default'){
    // set identifiers
    simple.id = id;
    if(simple instanceof Quantity) {
      simple.space = space;
    }

    this._storage.push(simple);
    return this;
  }
  select(id, space){
    let _id = space ? id+'$'+space : id;
    let foundElement = _.find(this._storage, (simple) => simple._id===_id);

    return foundElement;
  }
  /*importOne(q){
    // check existence of "class" property
    if(!('class' in q)){
      throw new Error('Argument in "importOne" should include "class" property.');
    }
    // select class based on "class" property
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined){
      throw new Error(`Unknown "class" ${q.class} in "importOne".`);
    }
    // create object and push to container
    let simple = new selectedClass(q);
    simple.container = this;
    this._storage.push(simple);
    // return SceneContainer for chain operations
    return simple;
  }*/
  importOne(
    q,
    strategy = 'upsert', // ['insert', 'update', 'upsert']
    deepMerge = true // if false than replace // XXX: not implemented
  ){
    // checking arguments
    if(!q || q.id===undefined) throw new Error('Q object must exist and have "id" property.');
    let _id = q.space
      ? q.id + '$' + q.space
      : q.id;
    let hasClass = 'class' in q;
    let targetComponent = this.select(_id);

    // check if class is known
    if(targetComponent===undefined && !hasClass)
      throw new Error(`Element with _id: "${_id}" is not exist and class cannot be estimated.`);
    // class cannot be changed
    if(hasClass && targetComponent && q.class !== targetComponent.className)
      throw new Error(`Component "${_id}" truing to change class which is not allowed in current version.`);

    // changes in existed components is not allowed
    if(strategy==='insert' && targetComponent!==undefined)
      throw new Error(`Component with _id: "${targetComponent._id}" is already exist which is not allowed for "insert" strategy.`);
    if(strategy==='insert' && !hasClass)
      throw new Error(`Imported component with id: "${q.id}" has no class which is not allowed for "insert" strategy.`);
    // creation of new components is not allowed
    if(strategy==='update' && targetComponent===undefined)
      throw new Error(`Element with _id: "${_id}" is not exist which is not allowed for "update" strategy.`);
    // can create new or change existed components
    // if(strategy==='upsert')

    if( // create new element
      strategy==='insert'
      || (strategy==='upsert' && targetComponent===undefined)
    ){
      let selectedClass = this.classes[q.class];
      if(selectedClass===undefined)
        throw new Error(`Unknown "class" ${q.class} in "importOne" for component id: "${q.id}".`);

      let simple = (new selectedClass).merge(q);
      this.insert(simple, q.id, q.space);
    }else if( // merge with previous element
      strategy==='update'
      || (strategy==='upsert' && targetComponent!==undefined)
    ){
      targetComponent.merge(q);
    }else{
      // just skip in other cases
    }

    return this;
  }
  importMany(qArr){
    qArr.forEach((q) => {
      this.importOne(q);
    });
  }
  toQArr(){
    let qArr = this._storage.map((obj) => obj.toQ());
    return qArr;
  }
  toJSON(){
    return JSON.stringify(this.toQArr(), null, 2);
  }
}

module.exports = {
  Container
};
