const Container = require('./container');
const coreItems = require('./container/core-items');

// set nunjacks environment
const nunjucksEnv = require('./nunjucks-env')('templates');

Container._exportClasses = {
  DBSolve: require('./dbsolve-export'),
  YAML: require('./yaml-export'),
  JSON: require('./json-export'),
  HetaCode: require('./heta-code-export'),
  SBML: require('./sbml-export'),
  SLV: require('./slv-export'),
  Mrgsolve: require('./mrgsolve-export'),
  Simbio: require('./simbio-export'),
  XLSX: require('./xlsx-export'),
  AnotherXLSX: require('./another-xlsx-export'),
  Matlab: require('./matlab-export'),
  Julia: require('./julia-export'),
  Dot: require('./dot-export'),
};

module.exports = {
  Container,
  coreItems,
  nunjucksEnv
};
