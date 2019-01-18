const { Quantity } = require('./core/quantity');
const { Compartment } = require('./core/compartment');
const { Species } = require('./core/species');
const { Reaction } = require('./core/reaction');
const { Scene } = require('./core/scene');
const { exception } = require('./exceptions');
const { Storage } = require('./storage');
const _ = require('lodash');

class Container {
  constructor(){
    this._storage = new Storage();
    this.classes = {
      Quantity,
      Compartment,
      Species,
      Reaction,
      Scene
    };
  }
  select(index){ // db-mode
    let foundElement = _.find(this._storage, (simple) => simple.id===index.id && simple.space===index.space);

    return foundElement;
  }
  insert(q){ // db-mode
    let hasClass = 'class' in q;
    let index = {id: q.id, space: q.space};

    // check if class is known
    if(!hasClass)
      throw new Error(`Element with index: "${index.id}" is not exist and class cannot be estimated.`);
    let selectedClass = this.classes[q.class];
    if(selectedClass===undefined)
      throw new Error(`Unknown "class" ${q.class} in "import" for component id: "${q.id}".`);

    let simple = (new selectedClass).merge(q);
    this._storage.set(index, simple);

    return this;
  }
  update(q){ // db-mode
    let hasClass = 'class' in q;
    let index = {id: q.id, space: q.space};
    let targetComponent = this.select(index);

    // creation of new components is not allowed
    if(targetComponent===undefined)
        throw new Error(`Element with index: "${index}" is not exist which is not allowed for "update" strategy.`);
    // class cannot be changed
    if(hasClass && targetComponent && q.class !== targetComponent.className)
      throw new Error(`Component "${index}" truing to change class which is not allowed in current version.`);

    targetComponent.merge(q);

    return this;
  }
  import( // db-mode
    q,
    deepMerge = true // XXX: not implemented
  ){
    // checking arguments
    let hasClass = 'class' in q;
    if(hasClass){
      this.insert(q);
    }else{
      this.update(q);
    }

    return this;
  }
  importMany(
    qArr,
    deepMerge = true // XXX: not implemented
  ){
    qArr.forEach((q) => {
      this.import(q, deepMerge);
    });
    return this;
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
