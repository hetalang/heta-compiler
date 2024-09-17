const _get = require('lodash/get');

module.exports = function(env) {
  // this is required for webpack when Environment is external and opts cannot be set with { autoescape: false }
  env.opts.autoescape = false;

  // add Filteers for Environment
  env.addFilter('filter2', function(arr, path, value) {
    return [...arr].filter((x) => _get(x, path)===value);
  });
  env.addFilter('exclude2', function(arr, path, value) {
    return [...arr].filter((x) => _get(x, path)!==value);
  });
  env.addFilter('getReactants', function(effectors) {
    return effectors
      .filter((effector) => !(effector.stoichiometry > 0));
  });
  env.addFilter('getProducts', function(effectors) {
    return effectors
      .filter((effector) => !(effector.stoichiometry < 0));
  });
  env.addFilter('toJSON', function(obj) {
    return JSON.stringify(obj);
  });
  env.addFilter('toStruct', function(obj) {
    return _toStruct(obj);
  });

  return env;
};

function _toStruct(obj) {
  if (Array.isArray(obj)) {
    return '[' + obj.map(_toStruct).join(',') + ']';
  } else if (typeof obj === 'object') {
    let pairs = Object.entries(obj).map(([key, value]) => `'${key}', ${_toStruct(value)}`);
    return `struct(${pairs.join(', ')})`;
  } else if (typeof obj === 'string') {
    return `'${obj}'`;
  } else if (typeof obj === 'number') {
    return obj;
  } else {
    throw new Error('Unsupported type');
  }
}