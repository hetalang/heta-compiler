const Container = require('./container');
const coreComponents = require('./container/core-components');

// set nunjacks environment
const nunjucksEnv = require('./nunjucks-env')('templates');

require('./yaml-export');
require('./json-export');
require('./sbml-export');
require('./slv-export');
require('./dbsolve-export');
require('./mrgsolve-export');
require('./simbio-export');
require('./xlsx-export');
require('./gsk-xlsx-export');
require('./matlab-export');
require('./julia-export');

module.exports = {
  Container,
  coreComponents,
  nunjucksEnv
};
