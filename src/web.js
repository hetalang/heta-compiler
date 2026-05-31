/*
  Entry file for web applications.
  You must run `npm run precompile` to precompile templates before using this file.
  It does not use specific Node.js features like:
  - StdoutTransport
*/

const { Builder } = require('./builder');
const Container = require('./container');
const coreItems = require('./container/core-items');
const ModuleSystem = require('./module-system');
const { Transport, StringTransport } = require('./logger');
const HetaLevelError = require('./heta-level-error');

// always load compiled templates
const templatesPath = './compiled-templates';
try {
  Builder._templates = require(templatesPath).templates;
} catch (error) {
  throw new Error(`Failed to load templates from "${templatesPath}". Cannot find or load the compiled .njk templates. Original error: ${error.message}`);
}

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
  ModuleSystem,
  Transport,
  StringTransport,
  HetaLevelError
};
