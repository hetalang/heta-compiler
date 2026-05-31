const { Builder } = require('./builder');
const Container = require('./container');
const coreItems = require('./container/core-items');
const ModuleSystem = require('./module-system');
const { Transport, StdoutTransport, StringTransport } = require('./logger');
const HetaLevelError = require('./heta-level-error');

// load raw templates
const { templates } = require('./templates');
// load compiled templates
//const { templates } = require('./compiled-templates');

global.compiledTemplates = templates;

// case-insensitive export names
Builder._exportClasses = {
  dbsolve: require('./dbsolve-export'),
  yaml: require('./yaml-export'),
  json: require('./json-export'),
  canonical: require('./canonical-export'),
  hetacode: require('./heta-code-export'),
  sbml: require('./sbml-export'),
  slv: require('./slv-export'),
  mrgsolve: require('./mrgsolve-export'),
  simbio: require('./simbio-export'),
  table: require('./table-export'),
  xlsx: require('./xlsx-export'),
  anotherxlsx: require('./another-xlsx-export'),
  matlab: require('./matlab-export'),
  julia: require('./julia-export'),
  dot: require('./dot-export'),
  summary: require('./summary-export'),
  mt: require('./mt-export'),
  dynms: require('./dynms-export'),
};

module.exports = {
  Builder,
  Container,
  coreItems,
  //nunjucksEnv,
  ModuleSystem,
  Transport,
  HetaLevelError,
  StdoutTransport,
  StringTransport,
};
