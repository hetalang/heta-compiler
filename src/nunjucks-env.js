const nunjucks = require('nunjucks');
const _ = require('lodash');

module.exports = (path) => {
  // initial version: loading templates based on relative path of the package
  // FileSystemLoader() works only in Node
  /*  
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(__dirname),
    { autoescape: false }
  );
  */

  // this version will look in "node_packages/heta-compiler/src" in node
  // and https://homepage.com/ in browser
  const env = nunjucks.configure(
    path,
    { autoescape: false }
  );

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
