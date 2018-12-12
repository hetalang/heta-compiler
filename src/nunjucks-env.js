const nunjucks = require('nunjucks');

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
  if(value===undefined){
    return _.filter(arr, (x) => _.get(x, path)!==undefined);
  }else{
    return _.filter(arr, [path, value]);
  }
});

module.exports = env;
