const { _parsePath } = require('../utils');

function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function validateOptions(validate, options) {
  if (validate(options)) return;
  const error = validate.errors[0];
  const parts = error.instancePath.split('/').slice(1).map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (error.keyword === 'required') parts.push(error.params.missingProperty);
  if (error.keyword === 'additionalProperties') parts.push(error.params.additionalProperty);
  const path = parts.reduce((result, part) => /^\d+$/.test(part) ? `${result}[${part}]` : `${result}.${part}`, 'options');
  let message = error.message;
  if (error.keyword === 'required') message = `missing required option "${error.params.missingProperty}"`;
  if (error.keyword === 'additionalProperties') message = `unknown option "${error.params.additionalProperty}"`;
  if (error.keyword === 'type') {
    const value = error.instancePath.split('/').slice(1)
      .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
      .reduce((current, part) => current?.[part], options);
    const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    message = `must be ${error.params.type}; got ${actualType}`;
  }
  if (error.keyword === 'minLength') message = 'must be a non-empty path';
  return {path, keyword: error.keyword, params: error.params, message: `"${path}": ${message}.`};
}

function validatePaths(paths, optionPath) {
  for (const [index, path] of paths.entries()) {
    const optionItem = `${optionPath}[${index}]`;
    if (path.split('.').some((part) => part === '')) {
      return {path: optionItem, message: `"${optionItem}" must be a valid path.`};
    }
    try {
      _parsePath(path);
    } catch (error) {
      return {path: optionItem, message: `Invalid path "${path}" in "${optionItem}".`};
    }
  }
}

module.exports = { isEmpty, validateOptions, validatePaths };

