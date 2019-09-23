const schema = require('../heta.json-schema');
const Ajv = require('ajv');

const validator = new Ajv({allErrors: true, jsonPointers: true})
  .addSchema(schema);
require('ajv-errors')(validator);

module.exports = {
  validator
};
