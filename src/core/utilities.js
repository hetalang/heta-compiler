const schema = require('./q-schema.json');
const Ajv = require('ajv');

const validator = new Ajv()
  .addSchema(schema);

module.exports = {
  validator
};
