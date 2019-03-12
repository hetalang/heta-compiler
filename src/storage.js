const _ = require('lodash');
const expect = require('chai').expect;

class Storage extends Map {
  constructor(){
    super();
  }
  set(key, value){
    expect(key).be.a('string');
    return super.set(key, value);
  }
  setByIndex(value){
    // check arguments
    expect(value).have.property('index').with.a('string');

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
