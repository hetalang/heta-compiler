const { isEmpty, validateOptions, validatePaths } = require('./utils');
const { _parsePath } = require('../utils');
const HetaLevelError = require('../heta-level-error');
const { ajv } = require('../ajv');

const validate = ajv.compile({
  type: 'object',
  required: ['paths'],
  additionalProperties: false,
  properties: {
    paths: {type: 'array', items: {type: 'string', minLength: 1}}
  }
});

function checkA002(builder, { options, description }) {
  const schemaError = validateOptions(validate, options);
  if (schemaError) {
    const {message, ...details} = schemaError;
    throw new HetaLevelError(
      `Invalid options for check A002: ${message}`,
      {diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: 'A002', ...details}
    );
  }
  const { paths } = options;
  const error = validatePaths(paths, 'options.paths');
  if (error) {
    throw new HetaLevelError(
      `Invalid options for check A002: ${error.message}`,
      {diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: 'A002', path: error.path}
    );
  }
  const missing = paths.filter((path) =>
    isEmpty(_parsePath(path).reduce((value, part) => value?.[part], builder))
  );

  const status = missing.length > 0 ? 'fail' : 'pass';
  const summary = missing.length > 0 ? `Missing or empty: ${missing.join(', ')}.` : '';
  builder.logger.info(
    `[A002] ${description}: ${status}` + (summary ? `\n${summary}` : ''),
    {auditCode: 'A002', status, summary, list: missing}
  );
}

module.exports = checkA002;
