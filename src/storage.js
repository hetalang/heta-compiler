const _ = require('lodash');
const should = require('should');

class Storage extends Map {
  constructor(){
    super();
  }
  set(key, value){
    key.should.be.String();
    return super.set(key, value);
  }
  setByIndex(value){
    // check arguments
    should(value).have.property('index').with.String();

    this.set(value.index, value);

    return value;
  }
  get length(){
    return this.size;
  }
}

module.exports = {
  Storage
};
