const nunjucks = require('nunjucks');
const _ = require('lodash');

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(__dirname),
  { autoescape: false }
);
/*
env.addFilter('selectattr2', function(arr, attr, value) {
  return arr.filter((x) => x[attr]===value);
});
*/
env.addFilter('filter2', function(arr, path, value) {
  return arr.filter((x) => _.get(x, path)===value);
});
env.addFilter('exclude2', function(arr, path, value) {
  return arr.filter((x) => _.get(x, path)!==value);
});

module.exports = env;
