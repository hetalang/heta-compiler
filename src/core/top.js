/*
    Top class for all other items of platform
*/

//const _ = require('lodash');
const randomId = require('random-id');
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv);
//ajvErrors(validate);

// options
const lengthRandom = 9;
const patternRandom = 'aA0';

const validate = ajv.compile({
  type: 'object',
  properties: {
    id: { '$ref': "#/definitions/ID" }
  },

  definitions: {
    ID: {
      description: "First character is letter, others are letter, digit or underscore.",
      type: "string",
      minLength: 1,
      pattern: "^[_a-zA-Z][_a-zA-Z0-9]*$",
      example: "x_12_"
    }
  }
});

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
    constructor(q = {}){
        let logger = this._container.logger;
        let valid = Top.isValid(q, logger);

        if (valid) {
          if (typeof q.id !== 'undefined') {
            this._id = q.id;
            this.isRandomId = false;
          } else {
            this._id = 'rand_' + randomId(lengthRandom, patternRandom);
            this.isRandomId = true;
          }
        }
    }
    get id(){
        return this._id;
    }
    get ind(){
        return this._id;
    }
    static get validate(){
      return validate;
    }
    static isValid(q, logger){
      let valid = this.validate(q);
      if (!valid) {
        let msg = `${q.id} Some of properties do not satisfy requirements for class "${this.name}"\n`
          + this.validate.errors.map((x, i) => `    ${i+1}. ${x.dataPath} ${x.message}`)
            .join('\n');
        logger.error(msg, {type: 'ValidationError', space: q.space});
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
}

module.exports = {
    Top
};
