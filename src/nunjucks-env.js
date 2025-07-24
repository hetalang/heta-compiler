const { _parsePath, _getByPathArray } = require('./utils');

module.exports = function(env) {
  // this is required for webpack when Environment is external and opts cannot be set with { autoescape: false }
  env.opts.autoescape = false;

  // add Filteers for Environment
  env.addFilter('filter2', function(arr, path, value) {
    let pathArray = _parsePath(path);
    return [...arr].filter((x) => _getByPathArray.call(x, pathArray) === value);
  });
  env.addFilter('exclude2', function(arr, path, value) {
    let pathArray = _parsePath(path);
    return [...arr].filter((x) => _getByPathArray.call(x, pathArray) !== value);
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
  env.addFilter('toYAML', function(obj) {
    return _toYAML(obj);
  });

  return env;
};

// for Matlab structures
function _toStruct(obj) {
  if (Array.isArray(obj)) {
    return '[' + obj.map(_toStruct).join(', ') + ']';
  } else if (typeof obj === 'object') {
    let pairs = Object.entries(obj)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `'${key}', ${_toStruct(value)}`);
    return `struct(${pairs.join(', ')})`;
  } else if (typeof obj === 'string') {
    return `'${obj}'`;
  } else if (typeof obj === 'number') {
    return obj;
  } else if (typeof obj === 'boolean') {
    return obj;
  } else if (obj === null) {
    return '[]';
  } else {
    throw new Error('Unsupported type');
  }
}

// for Heta aux property
function _toYAML(obj) {
  if (Array.isArray(obj)) {
    return '[' + obj.map(_toYAML).join(', ') + ']';
  } else if (typeof obj === 'object') {
    let pairs = Object.entries(obj)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${_toYAML(value)}`);
    return `{${pairs.join(', ')}}`;
  } else if (typeof obj === 'string') {
    let safeString = obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${safeString}"`;
  } else if (typeof obj === 'number') {
    return obj;
  } else if (typeof obj === 'boolean') {
    return obj;
  } else if (obj === null) {
    return 'null';
  } else {
    throw new Error('Unsupported type');
  }
}