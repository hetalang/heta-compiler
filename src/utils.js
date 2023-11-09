/*
  auxiliary functions and objects
*/

// preparation of Ajv

const Ajv = require('ajv');

const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv);

const schema = require('./heta.json-schema');
const validator = new Ajv({allErrors: true, jsonPointers: true}) // maybe combine with previous
  .addSchema(schema);
require('ajv-errors')(validator);


// return array of elements by the selector
function uniqBy(array, selector = (x) => x) {
  let indexes = [];
  let output = [];
  array.forEach((x) => {
    let ind = selector(x);
    if (indexes.indexOf(ind) === -1) {
      indexes.push(ind);
      output.push(x);
    }
  });

  return output;
}

function intersection(array1, array2) {
  if (array1.length < array2.length) {
    var arrayA = array1; // shorter
    var arrayB = array2;
  } else {
    arrayA = array2;
    arrayB = array1;
  }

  let intersect = [];
  arrayA.forEach((value) => {
    if (arrayB.indexOf(value) !== -1 && intersect.indexOf(value) === -1) {
      intersect.push(value);
    }
  });

  return intersect;
}

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
  ajv,
  uniqBy,
  intersection,
  flatten
};
