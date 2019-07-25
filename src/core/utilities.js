const schema = require('../heta.json-schema');
const Ajv = require('ajv');

const validator = new Ajv({allErrors: true, jsonPointers: true})
  .addSchema(schema);
require('ajv-errors')(validator);

// from qs3p-ts
// const randomId = require('random-id');
// let id = 'x_' + randomId(16); // length

module.exports = {
  validator
};
