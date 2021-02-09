/*
  auxilary functions and objects
*/

// preparation of Ajv

const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv);

module.exports = {
  ajv
};