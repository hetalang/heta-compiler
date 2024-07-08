/*
    Top class for all other items of platform
*/

const randomId = require('random-id');
const { ajv, flatten } = require('../utils');

// options
const lengthRandom = 9;
const patternRandom = 'aA0';

const schema = {
  type: 'object',
  properties: {
    id: { '$ref': '#/definitions/ID' }
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
class Top { // or const Top = class {...}
  /*
  new Top({id: 'ttt1'});
  */
  constructor(q = {}, isCore = false){
    let logger = this._container?.logger;
    let valid = Top.isValid(q, logger);
    if (!valid) { this.errored = true; return; }

    if (isCore) this.isCore = true;
    if (typeof q.id !== 'undefined') {
      this._id = q.id;
      this.isRandomId = false;
    } else {
      this._id = 'rand_' + randomId(lengthRandom, patternRandom);
      this.isRandomId = true;
    }
  }
  get id(){
    return this._id;
  }
  get index(){
    return this._id;
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
        + this.validate.errors.map((x, i) => `    ${i+1}. ${x.dataPath} ${x.message}`)
          .join('\n');
      logger?.error(msg, {type: 'ValidationError', space: q.space});
    }
    
    return valid;
  }
  _toQ(options = {}){
    let q = {};
    if (!this.isRandomId) q.id = this.id;

    return q;
  }
  toQ(options = {}){
    let q = this._toQ(options);
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
}

module.exports = {
  Top
};
