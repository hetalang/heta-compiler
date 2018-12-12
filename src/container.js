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
  importOne(q){
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
