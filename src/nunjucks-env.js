const _ = require('lodash');

module.exports = function(env) {
  env.addFilter('filter2', function(arr, path, value) {
    return arr.filter((x) => _.get(x, path)===value);
  });
  env.addFilter('exclude2', function(arr, path, value) {
    return arr.filter((x) => _.get(x, path)!==value);
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
