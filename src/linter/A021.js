const { isEmpty, validateOptions, validatePaths } = require('./utils');
const HetaLevelError = require('../heta-level-error');
const { ajv } = require('../ajv');

const validate = ajv.compile({
  type: 'object',
  additionalProperties: {type: 'array', items: {type: 'string', minLength: 1}}
});

function checkA021({ container }, { options, description, severity }) {
  const schemaError = validateOptions(validate, options);
  if (schemaError) {
    const {message, ...details} = schemaError;
    throw new HetaLevelError(
      `Invalid options for check A021: ${message}`,
      {diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: 'A021', ...details}
    );
  }
  for (const className of Object.keys(options)) {
    if (!Object.hasOwn(container.classes, className)) {
      throw new HetaLevelError(
        `Invalid options for check A021: Unknown class "${className}" at "options.${className}".`,
        {diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: 'A021', path: `options.${className}`, className}
      );
    }
    const error = validatePaths(options[className], `options.${className}`);
    if (error) {
      throw new HetaLevelError(
        `Invalid options for check A021: ${error.message}`,
        {diagnosticCode: 'LINTER_CHECK_INVALID_OPTIONS', auditCode: 'A021', path: error.path}
      );
    }
  }

  const results = [...container.namespaceStorage].map(([, ns]) => {
    const resultsItem = { space: ns.spaceName };
    Object.entries(options).forEach(([cls, paths]) => {
      resultsItem[cls] = {};
      paths.forEach((path) => {
        resultsItem[cls][path] = ns.selectByClassName(cls)
          .filter((component) => isEmpty(component.getProperty(path)))
          .map((component) => component.id);
      });
    });
    return resultsItem;
  });

  const hasMissing = results.some((item) =>
    Object.keys(options).some((cls) =>
      Object.values(item[cls]).some((ids) => ids.length > 0)
    )
  );

  let status = hasMissing ? 'fail' : 'pass';
  const level = status === 'pass' ? 'info' : severity
  const summaryLines = results.flatMap((item) =>
    Object.keys(options).flatMap((cls) =>
      Object.entries(item[cls])
        .filter(([, ids]) => ids.length > 0)
        .map(([path, ids]) => `${item.space} / ${cls} / ${path}: ${ids.join(', ')}`)
    )
  );
  const summary = summaryLines.join('\n');
  container.logger.log(level,
    `[A021] ${description}: ${status}` +
      (summary ? `\n${summary}` : ''),
    {auditCode: 'A021', status: status, summary, list: results}
  );
}

module.exports = checkA021;
