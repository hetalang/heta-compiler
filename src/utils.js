/*
  auxiliary functions and objects
*/

// preparation of Ajv

const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, useDefaults: true});
require('ajv-errors')(ajv);
ajv.addKeyword({keyword: "example"});

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

function differenceBy(array1, array2, selector = (x) => x) {
  let result = [];
  array1.forEach((x) => {
    let selected1 = selector(x);
    if (array2.map(selector).indexOf(selected1) === -1) {
      result.push(x);
    }
  });

  return result;
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

// clone all own properties and arrays
function cloneDeep(o) {
  if (o instanceof Object) {
    var clone;
    if (o instanceof Array) {
      clone = o.map((key) => cloneDeep(key));
    } else {
      clone = {};
      Object.keys(o).forEach((key) => {
        clone[key] = cloneDeep(o[key]);
      });
    }
    
    return clone;
  } else {
    return o;
  }
}

module.exports = {
  ajv,
  uniqBy,
  intersection,
  differenceBy,
  flatten,
  cloneDeep
};
