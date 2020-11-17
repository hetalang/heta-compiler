const Container = require('./container');
const coreComponents = require('./container/core-components');

// set nunjacks environment
const nunjucksEnv = require('./nunjucks-env')(__dirname + '/templates');

require('./yaml-export');
require('./json-export');
require('./sbml-export');
require('./slv-export');
require('./dbsolve-export');
require('./mrgsolve-export');
require('./simbio-export');
require('./xlsx-export');
require('./another-xlsx-export');
require('./matlab-export');
require('./sim-solver-export');

module.exports = {
  Container,
  coreComponents,
  nunjucksEnv 
};
