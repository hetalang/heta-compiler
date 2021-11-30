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

/* shorter but slower version
function uniqBy(array, selector = (x) => x) {
  let output = [];
  array.forEach((x) => {
    let x_ind = output.findIndex((y) => selector(y) === selector(x))
    if (x_ind === -1) output.push(x);
  });

  return output;
}
*/

module.exports = {
  ajv,
  uniqBy
};

