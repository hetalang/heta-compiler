const { Scene } = require('./core/scene');
const _ = require('lodash');

class Storage extends Array {
  constructor(){
    super();
  }
  set(index, simple){ // collection-mode
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
}

module.exports = {
  Storage
};
