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
  insert(simple, id, space){
    // set identifiers
    simple.id = id;
    if(simple instanceof Quantity) {
      simple.space = space;
    }

    this._storage.push(simple);
    return this;
  }
  select(id, space){
    let index = space ? id+'$'+space : id;
    let foundElement = _.find(this._storage, (simple) => simple.index===index);

    return foundElement;
  }
  importOne(
    q,
    strategy = 'upsert', // ['insert', 'update', 'upsert']
    deepMerge = true // if false than replace // XXX: not implemented
  ){
    // checking arguments
    if(!q || q.id===undefined) throw new Error('Q object must exist and have "id" property.');
    let index = q.space
      ? q.id + '$' + q.space
      : q.id;
    let hasClass = 'class' in q;
    let targetComponent = this.select(index);

    // check if class is known
    if(targetComponent===undefined && !hasClass)
      throw new Error(`Element with index: "${index}" is not exist and class cannot be estimated.`);
    // class cannot be changed
    if(hasClass && targetComponent && q.class !== targetComponent.className)
      throw new Error(`Component "${index}" truing to change class which is not allowed in current version.`);

    // changes in existed components is not allowed
    if(strategy==='insert' && targetComponent!==undefined)
      throw new Error(`Component with index: "${targetComponent.index}" is already exist which is not allowed for "insert" strategy.`);
    if(strategy==='insert' && !hasClass)
      throw new Error(`Imported component with id: "${q.id}" has no class which is not allowed for "insert" strategy.`);
    // creation of new components is not allowed
    if(strategy==='update' && targetComponent===undefined)
      throw new Error(`Element with index: "${index}" is not exist which is not allowed for "update" strategy.`);
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
  importMany(
    qArr,
    strategy = 'upsert', // ['insert', 'update', 'upsert']
    deepMerge = true // if false than replace // XXX: not implemented
  ){
    qArr.forEach((q) => {
      this.importOne(q, strategy, deepMerge);
    });
    return this;
  }
  scopedVariables(scope='default'){
    return this._storage.filter((component) => {
      return (component instanceof Quantity) && component.space===scope;
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
