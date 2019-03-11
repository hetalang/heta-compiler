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
  getByInstance(constructor, scope){
    return _.chain([...this])
      .filter((x) => (x[1] instanceof constructor) && x[1].space===scope)
      .map((x) => x[1])
      .value();
  }
  getByClassName(className, scope){
    return _.chain([...this])
      .filter((x) => (x[1].className===className) && x[1].space===scope)
      .map((x) => x[1])
      .value();
  }
}

module.exports = {
  Storage
};
