/*
  auxiliary functions and objects
*/

// preparation of Ajv

const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv);

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

module.exports = {
  ajv,
  uniqBy,
  intersection
};

