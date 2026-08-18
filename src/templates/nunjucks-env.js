const { _parsePath, _getByPathArray } = require('../utils');

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
  env.addFilter('eventsWithAssignments', function(events, population) {
    return events.filter((event) => population.selectRecordsByContext(event.id).length > 0);
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
  env.addFilter('toHetaDict', function(obj) {
    return _toHetaDict(obj);
  });
  env.addFilter('toSBMLNumber', function(value) {
    if (value === Infinity) return 'INF';
    if (value === -Infinity) return '-INF';
    if (Number.isNaN(value)) return 'NaN';
    return value;
  });
  env.addFilter('toJuliaNumber', function(value) {
    if (value === Infinity) return 'Inf';
    if (value === -Infinity) return '-Inf';
    if (Number.isNaN(value)) return 'NaN';
    return value;
  });
  env.addFilter('toMatlabNumber', function(value) {
    if (value === Infinity) return 'Inf';
    if (value === -Infinity) return '-Inf';
    if (Number.isNaN(value)) return 'NaN';
    return value;
  });
  env.addFilter('toMrgsolveParamNumber', function(value) {
    if (value === Infinity) return 'Inf';
    if (value === -Infinity) return '-Inf';
    if (Number.isNaN(value)) return 'NaN';
    return value;
  });
  env.addFilter('toMrgsolveCNumber', function(value) {
    if (value === Infinity) return 'INFINITY';
    if (value === -Infinity) return '-INFINITY';
    if (Number.isNaN(value)) return 'NAN';
    return value;
  });
  env.addFilter('toDBSolveNumber', function(value) {
    if (value === Infinity || Number.isNaN(value)) return '1.7976931348623157e+308';
    if (value === -Infinity) return '-1.7976931348623157e+308';
    return value;
  });

  return env;
};

// for Matlab structures
function _toStruct(obj) {
  if (Array.isArray(obj)) {
    return '[' + obj.map(_toStruct).join(', ') + ']';
  } else if (obj === null) {
    return '[]';
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
  } else {
    throw new Error('Unsupported type');
  }
}

// for Heta aux property
function _toYAML(obj) {
  if (Array.isArray(obj)) {
    return '[' + obj.map(_toYAML).join(', ') + ']';
  } else if (obj === null) {
    return 'null';
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
  } else {
    throw new Error('Unsupported type');
  }
}

function _toHetaDict(component = {}) {
  let pairs = [];
  let add = (key, value, condition = value !== undefined) => {
    if (condition) pairs.push(`${key}: ${value}`);
  };

  add('units', component.units);
  add('boundary', component.boundary, !!component.boundary);
  add('ss', component.ss, !!component.ss);
  add('compartment', component.compartment);
  if (_hasHetaLength(component.actors)) {
    add('actors', component.actors);
  }
  if (Array.isArray(component.modifiers) && component.modifiers.length > 0) {
    add('modifiers', _toHetaArray(component.modifiers));
  }
  add('reversible', component.reversible, component.reversible === false);
  add('isAmount', component.isAmount, !!component.isAmount);
  add('output', component.output, !!component.output);
  add('slope', component.slope, component.slope !== undefined && component.slope !== 1);
  add('intercept', component.intercept, component.intercept !== undefined && component.intercept !== 0);
  add('trigger', component.trigger);
  add('start', component.start);
  add('period', component.period);
  add('stop', component.stop);
  add('atStart', component.atStart);
  if (component.aux !== undefined && Object.keys(component.aux).length > 0) {
    add('aux', _toYAML(component.aux));
  }
  if (component.xmlAnnotation !== undefined) {
    add('xmlAnnotation', _toYAML(component.xmlAnnotation));
  }

  return pairs.length > 0 ? ` { ${pairs.join(', ')} }` : '';
}

function _toHetaArray(array = []) {
  return `[${array.join(', ')}]`;
}

function _hasHetaLength(value) {
  return (Array.isArray(value) || typeof value === 'string') && value.length > 0;
}
