const _get = require('lodash/get');

module.exports = function(env) {
  // this is required for webpack when Environment is external and opts cannot be set with { autoescape: false }
  env.opts.autoescape = false;

  // add Filteers for Environment
  env.addFilter('filter2', function(arr, path, value) {
    return arr.filter((x) => _get(x, path)===value);
  });
  env.addFilter('exclude2', function(arr, path, value) {
    return arr.filter((x) => _get(x, path)!==value);
  });
  env.addFilter('getReactants', function(effectors) {
    return effectors
      .filter((effector) => !(effector.stoichiometry > 0));
  });
  env.addFilter('getProducts', function(effectors) {
    return effectors
      .filter((effector) => !(effector.stoichiometry < 0));
  });

  return env;
};
