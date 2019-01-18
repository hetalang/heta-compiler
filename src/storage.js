const { Scene } = require('./core/scene');
const _ = require('lodash');

class Storage extends Array {
  constructor(){
    super();
  }
  set(index, simple){
    // set index
    simple.id = index.id;
    simple.space = index.space;

    let elementNumber = _.findIndex(this, (simple) => simple.id===index.id && simple.space===index.space);

    // set container
    if(simple instanceof Scene) {
      simple._storage = this;
    }

    if(elementNumber === -1) {
      this.push(simple);
    } else {
      this[elementNumber] = simple;
    }

    return simple;
  }
  get(index){
    return this.find((simple) => simple.id===index.id && simple.space===index.space);
  }
  delete(index){
    let elementNumber = _.findIndex(this, (simple) => simple.id===index.id && simple.space===index.space);
    if(elementNumber === -1)
      throw new Error(`Cannot delete element with index ${index.id} because it is not in Storage.`);

    return this.splice(elementNumber, 1);
  }
}

module.exports = {
  Storage
};
