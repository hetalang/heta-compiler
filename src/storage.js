const { Scene } = require('./core/scene');
const _ = require('lodash');
const should = require('should');



/**
 *
 */
class Storage extends Array {
  /**
   * constructor - description
   *
   * @return {type}  description
   */
  constructor(){
    super();
  }

  /**
   * add element to the storage.
   *
   * @param  {object} key  key object with two properties: `id`(required)
   * and `space`. This properties will be added to value object.
   * @param  {object} value any object. **mutable**
   * @return {object}        value object updated by `id` and `space`
   */
  set(key, value){
    // check arguments
    should(key).have.property('id').with.String();
    key.space!==undefined && should(key.space).is.String();

    // set key
    value.id = key.id;
    value.space = key.space;

    let elementNumber = _.findIndex(this, (value) => {
      return value.id===key.id
        && value.space===key.space;
    });

    // set container
    /*
    if(value instanceof Scene) {
      value._storage = this;
    }
    */

    if(elementNumber === -1) {
      this.push(value);
    } else {
      this[elementNumber] = value;
    }

    return value;
  }
  get(key){
    // check arguments
    should(key).have.property('id').with.String();
    key.space!==undefined && should(key.space).is.String();

    return this.find((value) => value.id===key.id && value.space===key.space);
  }
  delete(key){
    // check arguments
    should(key).have.property('id').with.String();
    key.space!==undefined && should(key.space).is.String();

    let elementNumber = _.findIndex(this, (value) => {
      return value.id===key.id
        && value.space===key.space;
    });
    if(elementNumber === -1)
      throw new Error(`Cannot delete element with key ${key.id} because it is not in Storage.`);

    return this.splice(elementNumber, 1)[0];
  }
}

module.exports = {
  Storage
};
