// preparation of Ajv

const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, useDefaults: true});
require('ajv-errors')(ajv);
ajv.addKeyword({keyword: "example"});

module.exports = { ajv };