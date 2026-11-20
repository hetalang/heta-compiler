const { ajv } = require('../ajv');
const schema = require('./linter.schema.json');

const validate = ajv.compile(schema);

function validateLinterConfig(config) {
  if (validate(config)) return [];
  return validate.errors.map((error) => {
    const location = error.instancePath || '/';
    let message = error.message;
    if (error.keyword === 'required') message = `missing required property "${error.params.missingProperty}"`;
    if (error.keyword === 'additionalProperties') message = `unknown property "${error.params.additionalProperty}"`;
    if (error.keyword === 'type') message = `must be ${error.params.type}`;
    if (error.keyword === 'enum') message = `must be one of: ${error.params.allowedValues.join(', ')}`;
    if (error.keyword === 'minLength') message = `must contain at least ${error.params.limit} character(s)`;
    let diagnosticCode;
    switch (error.keyword) {
    case 'required': diagnosticCode = 'LINTER_CONFIG_MISSING_PROPERTY'; break;
    case 'type': diagnosticCode = 'LINTER_CONFIG_INVALID_PROPERTY_TYPE'; break;
    case 'additionalProperties': diagnosticCode = 'LINTER_CONFIG_UNKNOWN_PROPERTY'; break;
    default: diagnosticCode = 'LINTER_CONFIG_INVALID_VALUE';
    }
    return { diagnosticCode, path: location, keyword: error.keyword, params: error.params, message: `${location}: ${message}` };
  });
}

module.exports = { validateLinterConfig };
