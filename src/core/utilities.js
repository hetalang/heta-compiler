// TODO: replace nesessary content to /src/utils.js

const schema = require('../heta.json-schema');
const Ajv = require('ajv');

const validator = new Ajv({allErrors: true, jsonPointers: true})
  .addSchema(schema);
require('ajv-errors')(validator);

function flatten(o){
  if (typeof o!== 'object')
    throw new TypeError('Object required.');
  
  let res = {};
  Object.entries(o).forEach(([key, value]) => {
    if(value instanceof Array) {
      res[key + '[]'] = value.map((x) => {
        if(typeof x === 'object'){
          return JSON.stringify(x);
        }else{
          return x;
        }
      }).join('; ');
    } else if (typeof value !== 'object') {
      res[key] = value;
    } else {
      let flat = flatten(value);
      Object.entries(flat)
        .forEach(([keyDeep, valueDeep]) => res[key + '.' + keyDeep] = valueDeep);
    }
  });

  return res;
}

module.exports = {
  validator,
  flatten
};
