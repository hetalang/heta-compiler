const _ = require('lodash');
const expect = require('chai').expect;
const { Model } = require('./core/model');

class Storage extends Map {
  constructor(){
    super();
  }
  set(key, value){
    expect(key).be.a('string');
    if(value instanceof Model) value._storage = this;
    return super.set(key, value);
  }
  delete(key){
    let res = super.get(key);
    if(res===undefined)
      throw new Error(`Element with key ${key} is not exist and cannot be deleted.`);
    super.delete(key);
    return res;
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
}

module.exports = {
  Storage
};
