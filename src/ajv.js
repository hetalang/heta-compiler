// preparation of Ajv

const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
require('ajv-errors')(ajv);
ajv.addKeyword({ keyword: 'example' });

const Ajv2020 = require('ajv/dist/2020');
const ajv2020 = new Ajv2020({ allErrors: true, useDefaults: true, strict: false });
require('ajv-errors')(ajv2020);
ajv2020.addKeyword({ keyword: 'example' });

module.exports = { ajv, ajv2020 };
