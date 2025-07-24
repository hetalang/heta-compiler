/*
    Top class for all other items of platform
*/

const randomId = require('random-id');
const { flatten, _getByPathArray, _parsePath } = require('../utils');
const { ajv } = require('../ajv');

// options to generate random id
const lengthRandom = 9;
const patternRandom = 'aA0';

const schema = {
  type: 'object',
  properties: {
    id: { '$ref': '#/definitions/ID' },
    xmlAnnotation: { type: 'string' }
  },

  definitions: {
    ID: {
      description: 'First character is letter, others are letter, digit or underscore.',
      type: 'string',
      minLength: 1,
      pattern: '^[_a-zA-Z][_a-zA-Z0-9]*$',
      example: 'x_12_'
    }
  }
};

/*
  class Top

  properties: {
      _id: <string>,
      randomId: <boolean>,
      _container: <Container>
  }

*/
class Top {
  constructor(isCore = false) {
    if (isCore) this._isCore = true;
    
    this._id = 'rand_' + randomId(lengthRandom, patternRandom);
    this.isRandomId = true;
  }
  merge(q = {}) {
    let logger = this._container?.logger;
    let valid = Top.isValid(q, logger);

    if (!valid) {
      this.errored = true;
      return this;
    }

    if (!!q.id) {
      this._id = q.id;
      delete this.isRandomId;
    }
    if (!!q.xmlAnnotation) {
      // TODO: validate XML?
      this.xmlAnnotation = q.xmlAnnotation;
    }

    return this;
  }
  get id(){
    return this._id;
  }
  get index(){
    return this._id;
  }
  get isCore(){
    return this._isCore;
  }
  get className(){
    return 'Top';
  }
  static get validate(){
    return ajv.compile(schema);
  }
  static isValid(q, logger){
    let valid = this.validate(q);
    
    if (!valid) {
      let msg = `${q.id} Some of properties do not satisfy requirements for class "${this.name}"\n`
        + this.validate.errors.map((x, i) => `    ${i+1}. ${x.instancePath} ${x.message}`)
          .join('\n');
      logger?.error(msg, {type: 'ValidationError', space: q.space});
    }
    
    return valid;
  }
  toQ(options = {}){
    let q = {};
    if (!this.isRandomId) {
      q.id = this.id
    }
    if (!!this.xmlAnnotation) {
      q.xmlAnnotation = this.xmlAnnotation;
    }

    q.action = 'defineTop';

    return q;
  } 
  toFlat(_options = {}){
    // set defaults
    let options = Object.assign({
      simplifyModifiers: true,
      simplifyActors: true,
      simplifyExpressions: true
    }, _options);

    let q = this.toQ(options);
    let res = flatten(q);

    return res;
  }
  /* recursively check class names */
  instanceOf(className){
    if (this.className === className) {
      return true;
    } else if (!this.className) {
      return false;
    } else {
      let proto = Object.getPrototypeOf(this);
      let isInstance = this.instanceOf.call(proto, className);
      //let isInstance = Object.getPrototypeOf(this).instanceOf(className);
      return isInstance;
    }
  }
  getProperty(path) {
    let pathArray = _parsePath(path);
    return _getByPathArray.call(this, pathArray);
  }
}

module.exports = {
  Top
};
