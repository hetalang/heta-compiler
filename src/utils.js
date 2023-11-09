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

module.exports = {
  ajv,
  uniqBy
};

