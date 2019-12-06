const schema = require('../heta.json-schema');
const Ajv = require('ajv');
const _ = require('lodash');

const validator = new Ajv({allErrors: true, jsonPointers: true})
  .addSchema(schema);
require('ajv-errors')(validator);

function flatten(o){
  if (typeof o!== 'object')
    throw new TypeError('Object required.');
  
  let res = {};
  _.each(o, (value, key) => {
    if(value instanceof Array) {
      res[key + '[]'] = value
        .map((x) => JSON.stringify(x))
        .join('; ');
    } else if (typeof value !== 'object') {
      res[key] = value;
    } else {
      let flat = flatten(value);
      _.each(flat, (valueDeep, keyDeep) => {
        res[key + '.' + keyDeep] = valueDeep;
      });
    }
  });

  return res;
}

module.exports = {
  validator,
  flatten
};
