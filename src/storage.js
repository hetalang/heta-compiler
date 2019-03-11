const _ = require('lodash');
const should = require('should');

class Storage extends Array {
  constructor(){
    super();
  }
  setByIndex(value){
    // check arguments
    should(value).have.property('id').with.String();
    value.space!==undefined && should(value.space).is.String();
    value._index = value.space + '.' + value.id;

    let elementNumber = this.findIndex((x) => x._index === value._index);

    if(elementNumber === -1) {
      this.push(value);
    } else {
      this[elementNumber] = value;
    }

    return value;
  }
  getByIndex(key){
    // check arguments
    should(key).have.property('id').with.String();
    key.space!==undefined && should(key.space).is.String();

    let _index = key.space + '.' + key.id;
    return this.find((x) => x._index === _index);
  }
  deleteByIndex(key){
    // check arguments
    should(key).have.property('id').with.String();
    key.space!==undefined && should(key.space).is.String();

    let _index = key.space + '.' + key.id;
    let elementNumber = this.findIndex((x) => x._index === _index);
    if(elementNumber === -1)
      throw new Error(`Cannot delete element with key ${key.id} because it is not in Storage.`);

    return this.splice(elementNumber, 1)[0];
  }
}

module.exports = {
  Storage
};
